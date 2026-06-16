import type { ReadonlyGameState as ReadonlyGameStateType } from '@songsofdoom/engine';
import {
	createEngineSerialisationContext,
	deserialiseJournalEntry,
	Engine,
	type EngineSerialisationContext,
	Field,
	InputStep,
	type JournalEntry,
	journalSerialisation,
	procedureDefinitions,
	ProcedureId,
	type ProcedureState,
	ReadonlyGameState,
	serialiseJournalEntry
} from '@songsofdoom/engine';
import { type CharacterState, entities, isCampaign } from '@songsofdoom/game';
import { prisma } from './db';
import { ConflictError, NotFoundError } from './errors';

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

export type GameEvent = GameStateEvent | GameInputRequiredEvent;

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
	private serialisationContext: EngineSerialisationContext;

	constructor() {
		this.serialisationContext = createEngineSerialisationContext();
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

		// Create and run the engine starting with the Setup procedure.
		const engine = Engine.create(procedureDefinitions, ProcedureId.RunCampaign, {
			step: undefined,
			status: 'ongoing',
			game: placeholderGame,
			campaignId: game.campaignId,
			characters
		} as unknown as ProcedureState);

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

	// -------------------------------------------------------------------
	// Persistence
	// -------------------------------------------------------------------

	/**
	 * Persists journal entries for a game to the database.
	 *
	 * @param fromIndex - Only persist entries from this index onward.
	 *   Defaults to the current persisted count.
	 */
	async persistJournal(gameId: string, engine: Engine, fromIndex?: number): Promise<void> {
		const startIndex = fromIndex ?? 0;
		const entries = engine.journal.slice(startIndex);
		if (entries.length === 0) return;

		const rows = entries.map((entry, i) => ({
			gameId,
			index: startIndex + i,
			data: serialiseJournalEntry(entry, this.serialisationContext)
		}));

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
	 * Rebuilds an engine from the persisted journal.
	 */
	private async loadEngine(gameId: string): Promise<Engine | undefined> {
		const rows = await prisma.journalEntry.findMany({
			where: { gameId },
			orderBy: { index: 'asc' }
		});

		if (rows.length === 0) return undefined;

		const journal = rows.map((row) =>
			deserialiseJournalEntry(row.data as object, this.serialisationContext)
		);

		return Engine.restore(procedureDefinitions, journal);
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
	 * Returns the full journal log without full game state for each entry.
	 */
	async getGameLog(gameId: string): Promise<LogEntry[]> {
		const entries = await this._getJournalEntries(gameId);
		return entries.map(({ state: { game: _game, ...state }, ...rest }) => ({
			...rest,
			state
		}));
	}

	/**
	 * Returns journal entries, preferring the in-memory engine if available.
	 */
	private async _getJournalEntries(gameId: string): Promise<JournalEntry[]> {
		const engine = this.engines.get(gameId);
		if (engine) {
			return [...engine.journal];
		}
		const rows = await prisma.journalEntry.findMany({
			where: { gameId },
			orderBy: { index: 'asc' }
		});
		return rows.map((row) =>
			journalSerialisation.deserialise<JournalEntry>(
				JSON.stringify(row.data as object),
				this.serialisationContext
			)
		);
	}

	private _serialiseGameState(game: ReadonlyGameStateType): object {
		return JSON.parse(journalSerialisation.serialise(game, this.serialisationContext)) as object;
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
