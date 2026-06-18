import type {
	ReadonlyGameState as ReadonlyGameStateType,
	RunCampaignState
} from '@songsofdoom/engine';
import {
	createEngineSerialisationContext,
	deserialiseJournalEntryFromParts,
	Engine,
	engineSerialisation,
	type EngineSerialisationContext,
	Field,
	InputStep,
	type JournalEntry,
	procedureDefinitions,
	ProcedureId,
	type ProcedureState,
	ReadonlyGameState,
	serialiseGameState,
	serialiseJournalEntryWithoutGame
} from '@songsofdoom/engine';
import { type CharacterState, entities, isCampaign } from '@songsofdoom/game';
import { join } from 'node:path';
import { prisma } from './db';
import { ConflictError, ForbiddenError, NotFoundError } from './errors';
import { FileStepLogger } from './step-logger';

// ---------------------------------------------------------------------------
// SSE subscriber interface
// ---------------------------------------------------------------------------

/**
 * A subscriber that receives game events pushed by {@link GameManager#broadcast}.
 *
 * Each subscriber corresponds to one connected SSE client. The manager calls
 * callbacks synchronously during broadcast — if a subscriber throws, the
 * error is caught and logged so other subscribers are not affected.
 */
export interface SSESubscriber {
	/** Send a state update event (new journal entries). */
	sendState(newEntries: JournalEntry[]): void;

	/** Send an input-required event. */
	sendInputRequired(awaitingPlayerId: string, fields: Field<unknown>[]): void;

	/** Send a meta update event (participants, status, etc.). */
	sendMeta(meta: GameMeta): void;

	/** Close the SSE connection with a reason. */
	close(reason?: string): void;
}

// ---------------------------------------------------------------------------
// Game event types
// ---------------------------------------------------------------------------

export interface GameStateEvent {
	type: 'state';
	newEntries: JournalEntry[];
}

export interface GameInputRequiredEvent {
	type: 'input-required';
	awaitingPlayerId: string;
	fields: Field<unknown>[];
}

/** Lightweight game metadata shared via SSE. */
export interface GameMeta {
	status: string;
	participants: Array<{ userId: string; characterId: number; characterName: string }>;
	campaignId: string | null;
	ownerId: string | null;
}

export interface GameMetaEvent {
	type: 'meta';
	meta: GameMeta;
}

export type GameEvent = GameStateEvent | GameInputRequiredEvent | GameMetaEvent;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum number of participants per game. */
export const MAX_PARTICIPANTS = 4;

/**
 * A journal entry without the full game state snapshot, suitable for log rendering.
 *
 * `T` is the state type (defaults to {@link ProcedureState}); `game` is
 * stripped so the response stays lightweight while preserving the
 * original entry structure including {@link JournalEntry#procedureId procedureId},
 * {@link JournalEntry#parentIndex parentIndex}, and all other metadata.
 */
export type LogEntry<T extends ProcedureState = ProcedureState> = Omit<JournalEntry, 'state'> & {
	state: Omit<T, 'game'>;
};

// ---------------------------------------------------------------------------
// GameManager
// ---------------------------------------------------------------------------

/**
 * Manages active game engines, persistence, and SSE subscriber fan-out.
 *
 * ## Lifecycle
 *
 * - `createGame()` — creates an engine, runs it to the first InputStep, persists
 *   the journal, and returns the game ID.
 * - `getEngine()` — returns the in-memory engine for a game, or `undefined` if
 *   the game is not loaded (e.g. after a server restart, the engine is rebuilt
 *   from the persisted journal on first access).
 * - `supplyInput()` — supplies input to the engine, runs until the next
 *   InputStep or completion, persists new entries, and broadcasts to subscribers.
 * - `subscribe()` / `unsubscribe()` — manage SSE subscribers for live updates.
 *
 * ## Persistence
 *
 * Journal entries are persisted to PostgreSQL after every `engine.run()` call.
 * On server restart, engines are rebuilt from the persisted journal via
 * `Engine.fromJSON()`.
 *
 * ## Serialisation
 *
 * Uses {@link engineSerialisation} from `@songsofdoom/engine`. The
 * {@link EngineSerialisationContext} is created once and reused for all
 * games — it resolves entity/property/talent/stat/event/focus/slot references
 * from the game package's catalog data.
 */
export class GameManager {
	/** Active engines by game ID. */
	private engines = new Map<string, Engine>();

	/** SSE subscribers by game ID. */
	private subscribers = new Map<string, Set<SSESubscriber>>();

	/** Shared serialisation context for all games. */
	readonly serialisationContext: EngineSerialisationContext;

	/** Directory where engine step logs are written. */
	private readonly _logsDir: string;

	constructor() {
		this.serialisationContext = createEngineSerialisationContext();
		this._logsDir = join(import.meta.dirname, '../../../../engine/logs/game');
	}

	// -------------------------------------------------------------------
	// Participation
	// -------------------------------------------------------------------

	/**
	 * Verifies that a user is a participant of a game.
	 *
	 * @throws {NotFoundError} if the game does not exist.
	 * @throws {ForbiddenError} if the user is not a participant.
	 */
	async verifyParticipant(gameId: string, userId: string): Promise<void> {
		const game = await prisma.game.findUnique({
			where: { id: gameId },
			select: {
				participants: {
					select: { userId: true }
				}
			}
		});

		if (!game) {
			throw new NotFoundError(`Game "${gameId}" not found`);
		}

		const isParticipant = game.participants.some((p) => p.userId === userId);
		if (!isParticipant) {
			throw new ForbiddenError('You are not a participant in this game');
		}
	}

	// -------------------------------------------------------------------
	// Game lifecycle (new PREPARATION → ACTIVE flow)
	// -------------------------------------------------------------------

	/**
	 * Creates a new game record in PREPARATION state with the chosen campaign,
	 * and adds the creator as the first participant.
	 */
	async createGame(userId: string, campaignId: string, characterId: number): Promise<string> {
		const campaign = entities.get(campaignId);
		if (!campaign || !isCampaign(campaign)) {
			throw new NotFoundError(`Campaign "${campaignId}" not found`);
		}

		const character = await prisma.character.findUnique({ where: { id: characterId } });
		if (!character) {
			throw new NotFoundError(`Character "${characterId}" not found`);
		}

		const game = await prisma.game.create({
			data: {
				campaignId,
				ownerId: userId,
				participants: {
					create: { userId, characterId }
				}
			}
		});
		return game.id;
	}

	/**
	 * Adds a participant (user + character) to a game in PREPARATION state.
	 */
	async joinGame(gameId: string, userId: string, characterId: number): Promise<void> {
		const game = await prisma.game.findUnique({
			where: { id: gameId },
			include: { participants: true }
		});

		if (!game) {
			throw new NotFoundError(`Game "${gameId}" not found`);
		}

		if (game.status !== 'PREPARATION') {
			throw new ConflictError(`Game "${gameId}" is not in PREPARATION state`);
		}

		if (game.participants.length >= MAX_PARTICIPANTS) {
			throw new ConflictError(`Game "${gameId}" already has the maximum number of participants`);
		}

		const userAlreadyInGame = game.participants.some((p) => p.userId === userId);
		if (userAlreadyInGame) {
			throw new ConflictError(`User "${userId}" is already a participant in game "${gameId}"`);
		}

		const characterAlreadyInGame = game.participants.some((p) => p.characterId === characterId);
		if (characterAlreadyInGame) {
			throw new ConflictError(`Character "${characterId}" is already in game "${gameId}"`);
		}

		const character = await prisma.character.findUnique({ where: { id: characterId } });
		if (!character) {
			throw new NotFoundError(`Character "${characterId}" not found`);
		}

		await prisma.gameParticipant.create({
			data: {
				gameId,
				userId,
				characterId
			}
		});

		// Broadcast updated participants
		await this._broadcastMeta(gameId);
	}

	/**
	 * Removes a participant from a game in PREPARATION state.
	 *
	 * After leaving, if no participants remain the game is left in PREPARATION
	 * state (owner can still join/re-invite, or abandon).
	 */
	async leaveGame(gameId: string, userId: string): Promise<void> {
		const game = await prisma.game.findUnique({
			where: { id: gameId },
			include: { participants: true }
		});

		if (!game) {
			throw new NotFoundError(`Game "${gameId}" not found`);
		}

		if (game.status !== 'PREPARATION') {
			throw new ConflictError(`Game "${gameId}" is not in PREPARATION state`);
		}

		const isParticipant = game.participants.some((p) => p.userId === userId);
		if (!isParticipant) {
			throw new ConflictError(`User "${userId}" is not a participant in game "${gameId}"`);
		}

		await prisma.gameParticipant.delete({
			where: { gameId_userId: { gameId, userId } }
		});

		// Broadcast updated participants
		await this._broadcastMeta(gameId);
	}

	/**
	 * Starts a game: validates prerequisites, creates the engine from the
	 * campaign chosen at creation time, runs it, and persists initial journal entries.
	 */
	async startGame(gameId: string): Promise<void> {
		const game = await prisma.game.findUnique({
			where: { id: gameId },
			include: { participants: { include: { character: { include: { revisions: true } } } } }
		});

		if (!game) {
			throw new NotFoundError(`Game "${gameId}" not found`);
		}

		if (game.participants.length === 0) {
			throw new ConflictError(`Game "${gameId}" has no participants`);
		}

		if (game.status !== 'PREPARATION') {
			throw new ConflictError(`Game "${gameId}" is not in PREPARATION state`);
		}

		if (!game.campaignId) {
			throw new ConflictError(`Game "${gameId}" has no campaign selected`);
		}

		const campaign = entities.get(game.campaignId);
		if (!campaign || !isCampaign(campaign)) {
			throw new NotFoundError(`Campaign "${game.campaignId}" not found`);
		}

		// Build character states for the Setup procedure.
		const characters = game.participants.map((p) => {
			const latestRevision = p.character.revisions[0];
			return (latestRevision?.state ?? {}) as unknown as CharacterState;
		});

		// Minimal placeholder game state — the Setup procedure replaces it.
		const placeholderGame = new ReadonlyGameState({ players: [] });

		// Create and run the engine. Engine.create() fleshes out the procedure's
		// default state (step, status) from the definition.
		const engine = Engine.create<RunCampaignState>(procedureDefinitions, ProcedureId.RunCampaign, {
			game: placeholderGame,
			campaignId: game.campaignId,
			characters
		});

		this._setEngineLogger(gameId, engine);
		engine.run();

		// Persist initial journal entries.
		await this.persistJournal(gameId, engine);

		// Update game status based on whether the engine is waiting for input.
		const newStatus = engine.currentEntry?.state.step !== undefined ? 'ACTIVE' : 'COMPLETE';
		await prisma.game.update({
			where: { id: gameId },
			data: { status: newStatus }
		});

		this.engines.set(gameId, engine);

		// Broadcast initial journal entries and meta update so clients
		// see the game board immediately.
		const initialEntries = engine.journal as JournalEntry[];
		if (initialEntries.length > 0) {
			this.broadcast(gameId, { type: 'state', newEntries: initialEntries });
		}
		await this._broadcastMeta(gameId);
	}

	// -------------------------------------------------------------------
	// Engine access
	// -------------------------------------------------------------------

	/**
	 * Returns the engine for the given game, loading it from the persisted
	 * journal if not already in memory.
	 */
	async getEngine(gameId: string): Promise<Engine | undefined> {
		let engine = this.engines.get(gameId);
		if (engine) return engine;

		// Rebuild from persisted journal
		engine = await this.loadEngine(gameId);
		if (engine) {
			this.engines.set(gameId, engine);
		}
		return engine;
	}

	/**
	 * Supplies input to the engine, runs until the next InputStep or
	 * completion, persists new entries, and broadcasts to subscribers.
	 */
	async supplyInput(
		gameId: string,
		input: Record<string, unknown>
	): Promise<{ completed: boolean; newEntries: JournalEntry[] }> {
		const engine = await this.getEngine(gameId);
		if (!engine) {
			throw new NotFoundError(`Game "${gameId}" not found.`);
		}

		const previousLength = engine.journal.length;

		engine.supplyInput(input);
		this._setEngineLogger(gameId, engine);
		const completed = engine.run();

		const newEntries = engine.journal.slice(previousLength) as JournalEntry[];

		// Persist new entries
		await this.persistJournal(gameId, engine, previousLength);

		// Update game status
		await prisma.game.update({
			where: { id: gameId },
			data: {
				status: completed ? 'COMPLETE' : 'ACTIVE'
			}
		});

		// Broadcast to subscribers
		if (newEntries.length > 0) {
			this.broadcast(gameId, { type: 'state', newEntries });
		}

		if (!completed && this.isAwaitingInput(engine)) {
			const { awaitingPlayerId, fields } = this.extractInputFields(engine);
			if (awaitingPlayerId && fields) {
				this.broadcast(gameId, {
					type: 'input-required',
					awaitingPlayerId,
					fields
				});
			}
		}

		return { completed, newEntries };
	}

	/**
	 * Returns the current input state for a game, or `undefined` if the engine
	 * is not currently awaiting input.
	 */
	getInputState(
		gameId: string
	): { awaitingPlayerId: string; fields: Field<unknown>[] } | undefined {
		const engine = this.engines.get(gameId);
		if (!engine) return undefined;
		if (!this.isAwaitingInput(engine)) return undefined;

		const { awaitingPlayerId, fields } = this.extractInputFields(engine);
		if (!awaitingPlayerId || !fields) return undefined;

		return { awaitingPlayerId, fields };
	}

	// -------------------------------------------------------------------
	// Persistence
	// -------------------------------------------------------------------

	/**
	 * Persists journal entries for a game to the database.
	 *
	 * Uses copy-on-write for the {@code gamestate} column: the game state
	 * snapshot is only written when it changed from the previous entry
	 * (detected via object-identity comparison).
	 *
	 * @param fromIndex - Only persist entries from this index onward.
	 *   Defaults to 0.
	 */
	async persistJournal(gameId: string, engine: Engine, fromIndex?: number): Promise<void> {
		const startIndex = fromIndex ?? 0;
		const entries = engine.journal.slice(startIndex);
		if (entries.length === 0) return;

		const rows = entries.map((entry, i) => {
			const actualIndex = startIndex + i;
			const prevEntry = actualIndex > 0 ? engine.journal[actualIndex - 1] : undefined;
			const gameStateChanged = !prevEntry || entry.state.game !== prevEntry.state.game;

			return {
				gameId,
				index: actualIndex,
				data: serialiseJournalEntryWithoutGame(entry, this.serialisationContext),
				gamestate: gameStateChanged
					? serialiseGameState(entry.state.game, this.serialisationContext)
					: undefined
			};
		});

		await prisma.journalEntry.createMany({ data: rows });
	}

	// -------------------------------------------------------------------
	// SSE subscribers
	// -------------------------------------------------------------------

	/**
	 * Registers an SSE subscriber for live game updates.
	 */
	subscribe(gameId: string, subscriber: SSESubscriber): void {
		let subs = this.subscribers.get(gameId);
		if (!subs) {
			subs = new Set();
			this.subscribers.set(gameId, subs);
		}
		subs.add(subscriber);
	}

	/**
	 * Removes an SSE subscriber.
	 */
	unsubscribe(gameId: string, subscriber: SSESubscriber): void {
		const subs = this.subscribers.get(gameId);
		if (subs) {
			subs.delete(subscriber);
			if (subs.size === 0) {
				this.subscribers.delete(gameId);
			}
		}
	}

	/**
	 * Broadcasts a game event to all subscribers of a game.
	 */
	broadcast(gameId: string, event: GameEvent): void {
		const subs = this.subscribers.get(gameId);
		if (!subs || subs.size === 0) return;

		for (const sub of subs) {
			try {
				switch (event.type) {
					case 'state':
						sub.sendState(event.newEntries);
						break;
					case 'input-required':
						sub.sendInputRequired(event.awaitingPlayerId, event.fields);
						break;
					case 'meta':
						sub.sendMeta(event.meta);
						break;
				}
			} catch (err) {
				console.error(`Error broadcasting to subscriber for game "${gameId}":`, err);
			}
		}
	}

	/**
	 * Removes an engine from memory (e.g. when a game is abandoned).
	 * The journal remains persisted in the database.
	 */
	removeEngine(gameId: string): void {
		this.engines.delete(gameId);
	}

	// -------------------------------------------------------------------
	// Internal helpers
	// -------------------------------------------------------------------

	/**
	 * Loads a game's metadata from DB and broadcasts it as a `meta` event
	 * to all SSE subscribers.
	 */
	private async _broadcastMeta(gameId: string): Promise<void> {
		const meta = await this._loadGameMeta(gameId);
		if (!meta) return;
		this.broadcast(gameId, { type: 'meta', meta });
	}

	/**
	 * Sends the current game metadata to a single SSE subscriber.
	 *
	 * Used on initial SSE connection so the client can transition out of
	 * 'connecting' status even when no state or input events are pending.
	 */
	async sendMetaToSubscriber(gameId: string, subscriber: SSESubscriber): Promise<void> {
		const meta = await this._loadGameMeta(gameId);
		if (!meta) return;

		try {
			subscriber.sendMeta(meta);
		} catch (err) {
			console.error(`Error sending meta for game "${gameId}" to subscriber:`, err);
		}
	}

	/**
	 * Loads game metadata from the database.
	 */
	private async _loadGameMeta(gameId: string): Promise<GameMeta | null> {
		const game = await prisma.game.findUnique({
			where: { id: gameId },
			select: {
				status: true,
				campaignId: true,
				ownerId: true,
				participants: {
					select: { userId: true, characterId: true, character: { select: { name: true } } }
				}
			}
		});

		if (!game) return null;

		return {
			status: game.status,
			campaignId: game.campaignId,
			ownerId: game.ownerId,
			participants: game.participants.map((p) => ({
				userId: p.userId,
				characterId: p.characterId,
				characterName: p.character.name
			}))
		};
	}

	/**
	 * Rebuilds an engine from the persisted journal.
	 *
	 * Reconstructs the full game state for each entry by tracking the last
	 * non-null {@code gamestate} column (copy-on-write optimisation).
	 */
	private async loadEngine(gameId: string): Promise<Engine | undefined> {
		const rows = await prisma.journalEntry.findMany({
			where: { gameId },
			orderBy: { index: 'asc' }
		});

		if (rows.length === 0) return undefined;

		let lastGameState: object | null = null;

		const journal = rows.map((row) => {
			const gamestate = (row.gamestate as object | null) ?? lastGameState;
			if (!gamestate) {
				throw new Error(
					`Missing gamestate for journal entry ${row.index} of game "${gameId}". ` +
						'The first entry must always carry a game state snapshot.'
				);
			}
			lastGameState = gamestate;

			return deserialiseJournalEntryFromParts(
				row.data as object,
				gamestate,
				this.serialisationContext
			);
		});

		const engine = Engine.restore(procedureDefinitions, journal);
		this._setEngineLogger(gameId, engine);
		return engine;
	}

	/**
	 * Checks whether the engine is currently paused at an InputStep.
	 */
	private isAwaitingInput(engine: Engine): boolean {
		const entry = engine.currentEntry;
		if (!entry || entry.state.status !== 'ongoing') return false;

		// Look up the step from the procedure definition.
		// If the engine stopped (run() returned false), the current step
		// is an InputStep (possibly wrapped in DispatchStep chains).
		const proc = procedureDefinitions[entry.procedureId];
		if (!proc) return false;

		const step = proc.steps[entry.state.step!];
		// Direct InputStep — DispatchStep chains are resolved in extractInputFields.
		return step instanceof InputStep;
	}

	/**
	 * Extracts input field information from the current engine state.
	 */
	private extractInputFields(engine: Engine): {
		awaitingPlayerId: string | null;
		fields: Field<unknown>[] | null;
	} {
		const entry = engine.currentEntry;
		if (!entry) return { awaitingPlayerId: null, fields: null };

		const proc = procedureDefinitions[entry.procedureId];
		if (!proc) return { awaitingPlayerId: null, fields: null };

		const step = proc.steps[entry.state.step!];
		if (!step) return { awaitingPlayerId: null, fields: null };

		// TODO: Handle DispatchStep chains that resolve to InputStep.
		// For now, only handle direct InputStep references.
		if (step instanceof InputStep) {
			const fields = step.getFields(entry.state as Parameters<typeof step.getFields>[0]);
			return {
				awaitingPlayerId: step.playerId ?? null,
				fields: [...fields]
			};
		}

		return { awaitingPlayerId: null, fields: null };
	}

	// -------------------------------------------------------------------
	// Game state retrieval
	// -------------------------------------------------------------------

	/**
	 * Returns the serialised current game state for a game.
	 */
	async getGameState(gameId: string): Promise<object | null> {
		const entries = await this._getJournalEntries(gameId);
		if (entries.length === 0) return null;
		return this._serialiseGameState(entries[entries.length - 1].state.game);
	}

	/**
	 * Returns the game state at a specific journal index.
	 * Supports negative indices (count from the back).
	 */
	async getGameStateAtIndex(gameId: string, index: number): Promise<object | null> {
		const entries = await this._getJournalEntries(gameId);
		if (entries.length === 0) return null;

		const resolvedIndex = index < 0 ? entries.length + index : index;
		if (resolvedIndex < 0 || resolvedIndex >= entries.length) {
			throw new Error(
				`Journal index ${index} out of bounds (journal has ${entries.length} entries)`
			);
		}

		return this._serialiseGameState(entries[resolvedIndex].state.game);
	}

	/**
	 * Returns journal log entries without full game state for each entry.
	 *
	 * @param gameId - The game to fetch the log for.
	 * @param since - Optional. When provided, only entries with `index > since`
	 *   are returned, enabling incremental log fetch.
	 */
	async getGameLog(gameId: string, since?: number): Promise<LogEntry[]> {
		const entries = await this._getJournalEntries(gameId, since);
		return entries.map(({ state: { game: _game, ...state }, ...rest }) => ({
			...rest,
			state
		}));
	}

	/**
	 * Returns journal entries, preferring the in-memory engine if available.
	 *
	 * @param since - Optional. When provided, only entries with `index > since`
	 *   are returned.
	 */
	private async _getJournalEntries(gameId: string, since?: number): Promise<JournalEntry[]> {
		const engine = this.engines.get(gameId);
		if (engine) {
			const all = [...engine.journal];
			if (since !== undefined) {
				return all.filter((_, i) => i > since);
			}
			return all;
		}
		const rows = await prisma.journalEntry.findMany({
			where: {
				gameId,
				...(since !== undefined ? { index: { gt: since } } : {})
			},
			orderBy: { index: 'asc' }
		});

		let lastGameState: object | null = null;

		return rows.map((row) => {
			const gamestate = (row.gamestate as object | null) ?? lastGameState;
			if (!gamestate) {
				throw new Error(
					`Missing gamestate for journal entry ${row.index} of game "${gameId}". ` +
						'The first entry must always carry a game state snapshot.'
				);
			}
			lastGameState = gamestate;

			return deserialiseJournalEntryFromParts(
				row.data as object,
				gamestate,
				this.serialisationContext
			);
		});
	}

	private _serialiseGameState(game: ReadonlyGameStateType): object {
		return engineSerialisation.decompose(game, this.serialisationContext) as object;
	}

	/**
	 * Attaches a {@link FileStepLogger} to the engine so step execution is
	 * logged to `packages/engine/logs/game/{gameId}.log`.
	 */
	private _setEngineLogger(gameId: string, engine: Engine): void {
		engine.setLogger(new FileStepLogger(gameId, this._logsDir));
	}
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let _instance: GameManager | null = null;

export function getGameManager(): GameManager {
	if (!_instance) {
		_instance = new GameManager();
	}
	return _instance;
}
