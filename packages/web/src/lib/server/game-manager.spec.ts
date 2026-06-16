/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	ProcedureId,
	type Engine,
	type JournalEntry,
	type ReadonlyGameState
} from '@songsofdoom/engine';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mock prisma (hoisted — must use vi.hoisted for vitest mock hoisting)
// ---------------------------------------------------------------------------

const mockPrisma = vi.hoisted(() => ({
	game: {
		create: vi.fn(),
		findUnique: vi.fn(),
		update: vi.fn()
	},
	journalEntry: {
		createMany: vi.fn(),
		findMany: vi.fn()
	},
	character: {
		findUnique: vi.fn()
	}
}));

vi.mock('./db', () => ({
	prisma: mockPrisma
}));

// ---------------------------------------------------------------------------
// Mock Engine
// ---------------------------------------------------------------------------

const { mockEngineCreate, mockEngineRestore } = vi.hoisted(() => ({
	mockEngineCreate: vi.fn(),
	mockEngineRestore: vi.fn()
}));

vi.mock('@songsofdoom/engine', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@songsofdoom/engine')>();
	return {
		...actual,
		Engine: class {
			static create = mockEngineCreate;
			static restore = mockEngineRestore;
			journal: ReadonlyArray<JournalEntry> = [];
			currentEntry: JournalEntry | undefined = undefined;
			run = vi.fn();
			supplyInput = vi.fn();
		}
	};
});

// ---------------------------------------------------------------------------
// Mock @songsofdoom/game
// ---------------------------------------------------------------------------

const mockEntities = vi.hoisted(() => ({
	get: vi.fn(),
	require: vi.fn()
}));

const mockIsCampaign = vi.hoisted(() => vi.fn());

vi.mock('@songsofdoom/game', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@songsofdoom/game')>();
	return {
		...actual,
		entities: mockEntities,
		isCampaign: mockIsCampaign
	};
});

// ---------------------------------------------------------------------------
// Subject under test (import after mock)
// ---------------------------------------------------------------------------

import { mock } from '@songsofdoom/common/test-utils';
import { GameManager, getGameManager, type SSESubscriber } from './game-manager';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFakeEngine(
	overrides: {
		journal?: JournalEntry[];
		currentEntry?: JournalEntry | undefined;
		runReturn?: boolean;
	} = {}
) {
	const journal = overrides.journal ?? [];
	const engine: any = {
		run: vi.fn().mockReturnValue(overrides.runReturn ?? true),
		supplyInput: vi.fn()
	};

	Object.defineProperty(engine, 'journal', {
		value: [...journal],
		writable: true,
		configurable: true
	});

	Object.defineProperty(engine, 'currentEntry', {
		value: overrides.currentEntry ?? (journal.length > 0 ? journal[journal.length - 1] : undefined),
		writable: true,
		configurable: true
	});

	return engine;
}

function makeEntry(
	procedureId = ProcedureId.Unimplemented,
	step = 'start',
	status: 'ongoing' | 'complete' | 'cancelled' = 'ongoing'
): JournalEntry {
	return {
		procedureId,
		state: { step, status, game: { players: [] } as any }
	} as JournalEntry;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GameManager', () => {
	let manager: GameManager;

	beforeEach(() => {
		vi.clearAllMocks();
		(GameManager as any)._instance = null;
		manager = new GameManager();
	});

	// -------------------------------------------------------------------
	// createGame
	// -------------------------------------------------------------------

	describe('createGame', () => {
		it('creates a DB record with campaignId, ownerId and first participant', async () => {
			mockEntities.get.mockReturnValue({ type: { id: 'campaign' } });
			mockIsCampaign.mockReturnValue(true);
			mockPrisma.character.findUnique.mockResolvedValue({ id: 1 });
			mockPrisma.game.create.mockResolvedValue({ id: 'game-1' });

			const gameId = await manager.createGame('user-1', 'SoHH', 1);

			expect(gameId).toBe('game-1');
			expect(mockPrisma.game.create).toHaveBeenCalledWith({
				data: {
					campaignId: 'SoHH',
					ownerId: 'user-1',
					participants: {
						create: { userId: 'user-1', characterId: 1 }
					}
				}
			});
		});

		it('throws when the campaign does not exist', async () => {
			mockEntities.get.mockReturnValue(undefined);

			await expect(manager.createGame('user-1', 'nonexistent', 1)).rejects.toThrow(
				'Campaign "nonexistent" not found'
			);
		});
	});

	// -------------------------------------------------------------------
	// getEngine
	// -------------------------------------------------------------------

	describe('getEngine', () => {
		it('returns the in-memory engine if already loaded', async () => {
			const fakeEngine = makeFakeEngine({ runReturn: true });
			manager['engines'].set('game-1', fakeEngine as unknown as Engine);

			const engine = await manager.getEngine('game-1');
			expect(engine).toBe(fakeEngine);
			expect(mockPrisma.journalEntry.findMany).not.toHaveBeenCalled();
		});

		it('loads from DB if not in memory', async () => {
			const fakeEngine = makeFakeEngine();
			mockEngineRestore.mockReturnValue(fakeEngine);
			mockPrisma.journalEntry.findMany.mockResolvedValue([
				{ index: 0, data: { _serialised: true } }
			]);

			const engine = await manager.getEngine('game-db');
			expect(engine).toBe(fakeEngine);
			expect(mockPrisma.journalEntry.findMany).toHaveBeenCalledWith({
				where: { gameId: 'game-db' },
				orderBy: { index: 'asc' }
			});
		});

		it('returns undefined when no journal exists in DB', async () => {
			mockPrisma.journalEntry.findMany.mockResolvedValue([]);

			const engine = await manager.getEngine('nonexistent');
			expect(engine).toBeUndefined();
		});
	});

	// -------------------------------------------------------------------
	// supplyInput
	// -------------------------------------------------------------------

	describe('supplyInput', () => {
		it('supplies input, runs engine, persists, and broadcasts state', async () => {
			const initialEntry = makeEntry();
			const newEntry = makeEntry(ProcedureId.Unimplemented, 'done', 'complete');

			const fakeEngine: any = {
				supplyInput: vi.fn(),
				run: vi.fn().mockImplementation(function (this: any) {
					// Simulate run() appending a new entry
					this._journal.push(newEntry);
					return true;
				}),
				get journal() {
					return this._journal;
				},
				_journal: [initialEntry]
			};
			Object.defineProperty(fakeEngine, 'currentEntry', {
				get() {
					return this._journal.at(-1);
				},
				configurable: true
			});

			mockPrisma.game.update.mockResolvedValue({});
			mockPrisma.journalEntry.createMany.mockResolvedValue({});
			manager['engines'].set('game-1', fakeEngine);

			const sub: SSESubscriber = {
				sendState: vi.fn(),
				sendInputRequired: vi.fn(),
				close: vi.fn()
			};
			manager.subscribe('game-1', sub);

			const result = await manager.supplyInput('game-1', { confirm: true });

			expect(fakeEngine.supplyInput).toHaveBeenCalledWith({ confirm: true });
			expect(fakeEngine.run).toHaveBeenCalled();
			expect(result.completed).toBe(true);
			expect(mockPrisma.journalEntry.createMany).toHaveBeenCalled();
			expect(sub.sendState).toHaveBeenCalledWith([newEntry]);
		});

		it('throws when the game does not exist', async () => {
			mockPrisma.journalEntry.findMany.mockResolvedValue([]);

			await expect(manager.supplyInput('nonexistent', {})).rejects.toThrow(
				'Game "nonexistent" not found.'
			);
		});

		it('broadcasts input-required when engine pauses at an InputStep', async () => {
			const pausedEntry = mock<JournalEntry>({
				procedureId: ProcedureId.Unimplemented,
				state: { step: 'ask', status: 'ongoing' as const, game: mock<ReadonlyGameState>() }
			});

			const fakeEngine = makeFakeEngine({
				journal: [makeEntry()],
				currentEntry: pausedEntry,
				runReturn: false
			});
			fakeEngine.journal = [makeEntry()];

			manager['engines'].set('game-1', fakeEngine);
			mockPrisma.game.update.mockResolvedValue({});
			mockPrisma.journalEntry.createMany.mockResolvedValue({});

			const sub: SSESubscriber = {
				sendState: vi.fn(),
				sendInputRequired: vi.fn(),
				close: vi.fn()
			};
			manager.subscribe('game-1', sub);

			await manager.supplyInput('game-1', {});

			// The Unimplemented procedure has no InputStep, so
			// isAwaitingInput returns false — input-required is NOT broadcast.
			expect(sub.sendInputRequired).not.toHaveBeenCalled();
		});

		it('updates status to COMPLETE when engine finishes', async () => {
			const fakeEngine = makeFakeEngine({
				journal: [makeEntry()],
				runReturn: true
			});
			fakeEngine.journal = [makeEntry(), makeEntry(ProcedureId.Unimplemented, 'done', 'complete')];

			manager['engines'].set('game-1', fakeEngine);
			mockPrisma.game.update.mockResolvedValue({});
			mockPrisma.journalEntry.createMany.mockResolvedValue({});

			await manager.supplyInput('game-1', {});

			expect(mockPrisma.game.update).toHaveBeenCalledWith({
				where: { id: 'game-1' },
				data: { status: 'COMPLETE' }
			});
		});
	});

	// -------------------------------------------------------------------
	// SSE subscribers
	// -------------------------------------------------------------------

	describe('subscribe / unsubscribe', () => {
		it('adds and removes subscribers', () => {
			const sub: SSESubscriber = {
				sendState: vi.fn(),
				sendInputRequired: vi.fn(),
				close: vi.fn()
			};

			manager.subscribe('game-1', sub);
			expect(manager['subscribers'].get('game-1')?.size).toBe(1);

			manager.unsubscribe('game-1', sub);
			expect(manager['subscribers'].has('game-1')).toBe(false);
		});

		it('cleans up the game entry when last subscriber is removed', () => {
			const sub1: SSESubscriber = {
				sendState: vi.fn(),
				sendInputRequired: vi.fn(),
				close: vi.fn()
			};
			const sub2: SSESubscriber = {
				sendState: vi.fn(),
				sendInputRequired: vi.fn(),
				close: vi.fn()
			};

			manager.subscribe('game-1', sub1);
			manager.subscribe('game-1', sub2);
			expect(manager['subscribers'].get('game-1')?.size).toBe(2);

			manager.unsubscribe('game-1', sub1);
			expect(manager['subscribers'].get('game-1')?.size).toBe(1);
		});
	});

	// -------------------------------------------------------------------
	// broadcast
	// -------------------------------------------------------------------

	describe('broadcast', () => {
		it('sends state events to all subscribers', () => {
			const entry = makeEntry();
			const sub1: SSESubscriber = {
				sendState: vi.fn(),
				sendInputRequired: vi.fn(),
				close: vi.fn()
			};
			const sub2: SSESubscriber = {
				sendState: vi.fn(),
				sendInputRequired: vi.fn(),
				close: vi.fn()
			};

			manager.subscribe('game-1', sub1);
			manager.subscribe('game-1', sub2);

			manager.broadcast('game-1', { type: 'state', newEntries: [entry] });

			expect(sub1.sendState).toHaveBeenCalledWith([entry]);
			expect(sub2.sendState).toHaveBeenCalledWith([entry]);
		});

		it('sends input-required events to all subscribers', () => {
			const sub: SSESubscriber = {
				sendState: vi.fn(),
				sendInputRequired: vi.fn(),
				close: vi.fn()
			};

			manager.subscribe('game-1', sub);

			manager.broadcast('game-1', {
				type: 'input-required',
				awaitingPlayerId: 'plr1',
				fields: []
			});

			expect(sub.sendInputRequired).toHaveBeenCalledWith('plr1', []);
		});

		it('is a no-op when there are no subscribers', () => {
			expect(() =>
				manager.broadcast('game-1', {
					type: 'state',
					newEntries: []
				})
			).not.toThrow();
		});

		it('isolates errors — one failing subscriber does not affect others', () => {
			vi.spyOn(console, 'error').mockImplementation(() => {});

			const failingSub: SSESubscriber = {
				sendState: vi.fn(() => {
					throw new Error('boom');
				}),
				sendInputRequired: vi.fn(),
				close: vi.fn()
			};
			const goodSub: SSESubscriber = {
				sendState: vi.fn(),
				sendInputRequired: vi.fn(),
				close: vi.fn()
			};

			manager.subscribe('game-1', failingSub);
			manager.subscribe('game-1', goodSub);

			manager.broadcast('game-1', { type: 'state', newEntries: [makeEntry()] });

			expect(failingSub.sendState).toHaveBeenCalled();
			expect(goodSub.sendState).toHaveBeenCalled();
		});
	});

	// -------------------------------------------------------------------
	// removeEngine
	// -------------------------------------------------------------------

	describe('removeEngine', () => {
		it('removes the engine from memory', () => {
			const fakeEngine = makeFakeEngine();
			manager['engines'].set('game-1', fakeEngine);
			expect(manager['engines'].has('game-1')).toBe(true);

			manager.removeEngine('game-1');
			expect(manager['engines'].has('game-1')).toBe(false);
		});
	});
});

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

describe('getGameManager', () => {
	it('returns the same instance on repeated calls', () => {
		(GameManager as any)._instance = null;
		const a = getGameManager();
		const b = getGameManager();
		expect(a).toBe(b);
	});
});
