import type { ProcedureId, ProcedureState } from '@songsofdoom/engine';
import {
	createEngineSerialisationContext,
	deserialiseJournalEntry,
	Engine,
	type EngineSerialisationContext,
	Field,
	InputStep,
	type JournalEntry,
	procedureDefinitions,
	serialiseJournalEntry
} from '@songsofdoom/engine';
import { prisma } from './db';

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
	// Engine management
	// -------------------------------------------------------------------

	/**
	 * Creates a new game, starts the engine at the given procedure, and runs
	 * until the first {@link InputStep} or completion.
	 *
	 * @returns The new game's ID.
	 */
	async createGame(procedureId: ProcedureId, initialState: ProcedureState): Promise<string> {
		const engine = Engine.create(procedureDefinitions, procedureId, initialState);

		// Create the database record
		const game = await prisma.game.create({
			data: { status: 'CREATING' }
		});

		// Run the engine to the first InputStep (or completion)
		const completed = engine.run();

		// Persist all journal entries produced so far
		await this.persistJournal(game.id, engine);

		// Update game status
		await prisma.game.update({
			where: { id: game.id },
			data: {
				status: completed ? 'COMPLETE' : 'AWAITING_INPUT'
			}
		});

		this.engines.set(game.id, engine);
		return game.id;
	}

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
			throw new Error(`Game "${gameId}" not found.`);
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
				status: completed ? 'COMPLETE' : 'AWAITING_INPUT'
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
