/* eslint-disable @typescript-eslint/no-explicit-any */
import { mock } from '@songsofdoom/common/test-utils';
import { ProcedureId } from '@songsofdoom/engine';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const { mockGetGameManager, mockError, mockJson, mockEngineSerialisation } = vi.hoisted(() => ({
	mockGetGameManager: vi.fn(),
	mockError: vi.fn((status: number, body: string) => {
		const err = new Error(body) as Error & { status: number; body: string };
		err.status = status;
		err.body = body;
		throw err;
	}),
	mockJson: vi.fn((data: unknown, init?: ResponseInit) => new Response(JSON.stringify(data), init)),
	mockEngineSerialisation: {
		serialise: vi.fn((payload: unknown) => JSON.stringify(payload))
	}
}));

vi.mock('$lib/server/game-manager', () => ({
	getGameManager: mockGetGameManager
}));

vi.mock('@songsofdoom/engine', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@songsofdoom/engine')>();
	return {
		...actual,
		engineSerialisation: mockEngineSerialisation
	};
});

vi.mock('@sveltejs/kit', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@sveltejs/kit')>();
	return { ...actual, error: mockError, json: mockJson };
});

// ---------------------------------------------------------------------------
// Subject under test
// ---------------------------------------------------------------------------

import type { GameManager, SSESubscriber } from '$lib/server/game-manager';
import type { JournalEntry } from '@songsofdoom/engine';
import { GET } from './+server';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface HandlerArgs {
	params: { gameId: string };
	locals: App.Locals;
	url?: URL;
}

function authenticatedLocals(): App.Locals {
	return { user: { id: 'user-1', username: 'test' }, session: null };
}

/** Creates a minimal JournalEntry for use in test engine journals. */
function makeEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
	return {
		procedureId: ProcedureId.Unimplemented,
		state: { step: 'start', status: 'ongoing' as const, game: { players: [] } as any },
		...overrides
	} as JournalEntry;
}

/** Creates a mock engine with a journal array and getter for .journal. */
function makeFakeEngine(entries: JournalEntry[]): any {
	const engine: any = {
		_journal: [...entries]
	};
	Object.defineProperty(engine, 'journal', {
		get() {
			return engine._journal;
		},
		configurable: true
	});
	return engine;
}

/**
 * Reads SSE events from a {@link ReadableStream} and returns parsed
 * `{ event, data }` objects.
 *
 * The reader is cancelled after `maxEvents` have been collected, or when
 * the stream closes naturally.
 */
async function collectSSEEvents(
	response: Response,
	maxEvents?: number
): Promise<{ event: string; data: unknown }[]> {
	const reader = response.body!.getReader();
	const textDecoder = new TextDecoder();
	const events: { event: string; data: unknown }[] = [];
	let buffer = '';

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			// In Node.js, new Response(ReadableStream) may yield chunks as
			// Uint8Array or as the raw type that was enqueued (string).
			// Handle both cases so tests work across environments.
			const chunk: string =
				value instanceof Uint8Array
					? textDecoder.decode(value, { stream: true })
					: typeof value === 'string'
						? value
						: '';
			buffer += chunk;

			const parts = buffer.split('\n\n');
			buffer = parts.pop() ?? '';

			for (const part of parts) {
				const trimmed = part.trim();
				if (!trimmed) continue;

				const eventMatch = /^event: (.+)$/m.exec(trimmed);
				const dataMatch = /^data: (.+)$/m.exec(trimmed);
				if (eventMatch && dataMatch) {
					events.push({
						event: eventMatch[1],
						data: JSON.parse(dataMatch[1])
					});
				}
			}

			if (maxEvents !== undefined && events.length >= maxEvents) {
				// Release the lock without triggering stream cancel
				// (the cancel callback would unsubscribe, which we
				//  test separately in the disconnect test).
				reader.releaseLock();
				break;
			}
		}
	} finally {
		// Ensure the reader is always released
		try {
			reader.releaseLock();
		} catch {
			/* already released */
		}
	}

	return events;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/game/[gameId]/events', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockEngineSerialisation.serialise.mockImplementation((p: unknown) => JSON.stringify(p));
	});

	// ─── Authentication ──────────────────────────────────────────────────

	it('returns 401 when user is not authenticated', async () => {
		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: { user: null, session: null }
		};

		await expect(GET(args as any)).rejects.toMatchObject({
			status: 401,
			message: 'Authentication required'
		});
	});

	// ─── Authorization ───────────────────────────────────────────────────

	it('returns 404 when game is not found during participation check', async () => {
		const { NotFoundError } = await import('$lib/server/errors');
		const mockManager = mock<GameManager>({
			verifyParticipant: vi.fn().mockRejectedValue(new NotFoundError('Game "game-1" not found'))
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals()
		};

		await expect(GET(args as any)).rejects.toMatchObject({
			status: 404,
			message: 'Game "game-1" not found'
		});
	});

	it('returns 403 when user is not a participant', async () => {
		const { ForbiddenError } = await import('$lib/server/errors');
		const mockManager = mock<GameManager>({
			verifyParticipant: vi
				.fn()
				.mockRejectedValue(new ForbiddenError('You are not a participant in this game'))
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals()
		};

		await expect(GET(args as any)).rejects.toMatchObject({
			status: 403,
			message: 'You are not a participant in this game'
		});
	});

	// ─── Engine pre-load ─────────────────────────────────────────────────

	it('returns 404 when the engine cannot be loaded', async () => {
		const mockManager = mock<GameManager>({
			verifyParticipant: vi.fn().mockResolvedValue(undefined),
			getEngine: vi.fn().mockResolvedValue(undefined)
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals()
		};

		await expect(GET(args as any)).rejects.toMatchObject({
			status: 404,
			message: 'Game "game-1" not found'
		});
	});

	// ─── Response headers ────────────────────────────────────────────────

	it('responds with text/event-stream content type and no-cache', async () => {
		const fakeEngine = makeFakeEngine([]);
		const mockManager = mock<GameManager>({
			serialisationContext: {} as any,
			verifyParticipant: vi.fn().mockResolvedValue(undefined),
			getEngine: vi.fn().mockResolvedValue(fakeEngine),
			getInputState: vi.fn().mockReturnValue(undefined),
			subscribe: vi.fn()
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals()
		};

		const response = await GET(args as any);
		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toBe('text/event-stream');
		expect(response.headers.get('Cache-Control')).toBe('no-cache');
		expect(response.headers.get('Connection')).toBe('keep-alive');

		// Clean up — release the stream so the test doesn't leak
		await response.body?.cancel();
	});

	// ─── Catch-up with ?since= ───────────────────────────────────────────

	it('pre-flushes entries after the since index', async () => {
		const entry0 = makeEntry({
			state: { step: 'first', status: 'ongoing' as const, game: { players: [] } as any }
		});
		const entry1 = makeEntry({
			state: { step: 'second', status: 'ongoing' as const, game: { players: [] } as any }
		});
		const entry2 = makeEntry({
			state: { step: 'third', status: 'complete' as const, game: { players: [] } as any }
		});
		const fakeEngine = makeFakeEngine([entry0, entry1, entry2]);

		const mockManager = mock<GameManager>({
			serialisationContext: {} as any,
			verifyParticipant: vi.fn().mockResolvedValue(undefined),
			getEngine: vi.fn().mockResolvedValue(fakeEngine),
			getInputState: vi.fn().mockReturnValue(undefined),
			subscribe: vi.fn()
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			url: new URL('http://localhost/api/game/game-1/events?since=0')
		};

		const response = await GET(args as any);
		const events = await collectSSEEvents(response, 1);

		expect(events).toHaveLength(1);
		expect(events[0].event).toBe('state');
		expect((events[0].data as any).newEntries).toHaveLength(2);
		expect((events[0].data as any).newEntries[0].state.step).toBe('second');
		expect((events[0].data as any).newEntries[1].state.step).toBe('third');
	});

	it('does not pre-flush when since is beyond the journal', async () => {
		const entry = makeEntry();
		const fakeEngine = makeFakeEngine([entry]);

		const mockManager = mock<GameManager>({
			serialisationContext: {} as any,
			verifyParticipant: vi.fn().mockResolvedValue(undefined),
			getEngine: vi.fn().mockResolvedValue(fakeEngine),
			getInputState: vi.fn().mockReturnValue(undefined),
			subscribe: vi.fn()
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			url: new URL('http://localhost/api/game/game-1/events?since=10')
		};

		const response = await GET(args as any);

		// The stream should be idle (no catch-up events).  Wait briefly
		// then cancel and check that subscribe was still called.
		await new Promise((r) => setTimeout(r, 50));
		await response.body?.cancel();

		expect(mockManager.subscribe).toHaveBeenCalledWith('game-1', expect.anything());
	});

	it('does not pre-flush when since is not provided', async () => {
		const entry = makeEntry();
		const fakeEngine = makeFakeEngine([entry]);

		const mockManager = mock<GameManager>({
			serialisationContext: {} as any,
			verifyParticipant: vi.fn().mockResolvedValue(undefined),
			getEngine: vi.fn().mockResolvedValue(fakeEngine),
			getInputState: vi.fn().mockReturnValue(undefined),
			subscribe: vi.fn()
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals()
		};

		const response = await GET(args as any);

		await new Promise((r) => setTimeout(r, 50));
		await response.body?.cancel();

		expect(mockManager.subscribe).toHaveBeenCalledWith('game-1', expect.anything());
	});

	it('does not pre-flush when since is a negative number', async () => {
		const entry = makeEntry();
		const fakeEngine = makeFakeEngine([entry]);

		const mockManager = mock<GameManager>({
			serialisationContext: {} as any,
			verifyParticipant: vi.fn().mockResolvedValue(undefined),
			getEngine: vi.fn().mockResolvedValue(fakeEngine),
			getInputState: vi.fn().mockReturnValue(undefined),
			subscribe: vi.fn()
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			url: new URL('http://localhost/api/game/game-1/events?since=-1')
		};

		const response = await GET(args as any);

		await new Promise((r) => setTimeout(r, 50));
		await response.body?.cancel();

		expect(mockManager.subscribe).toHaveBeenCalledWith('game-1', expect.anything());
	});

	it('does not pre-flush when since is not a number', async () => {
		const entry = makeEntry();
		const fakeEngine = makeFakeEngine([entry]);

		const mockManager = mock<GameManager>({
			serialisationContext: {} as any,
			verifyParticipant: vi.fn().mockResolvedValue(undefined),
			getEngine: vi.fn().mockResolvedValue(fakeEngine),
			getInputState: vi.fn().mockReturnValue(undefined),
			subscribe: vi.fn()
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			url: new URL('http://localhost/api/game/game-1/events?since=abc')
		};

		const response = await GET(args as any);

		await new Promise((r) => setTimeout(r, 50));
		await response.body?.cancel();

		expect(mockManager.subscribe).toHaveBeenCalledWith('game-1', expect.anything());
	});

	it('does not pre-flush when since is a float', async () => {
		const entry = makeEntry();
		const fakeEngine = makeFakeEngine([entry]);

		const mockManager = mock<GameManager>({
			serialisationContext: {} as any,
			verifyParticipant: vi.fn().mockResolvedValue(undefined),
			getEngine: vi.fn().mockResolvedValue(fakeEngine),
			getInputState: vi.fn().mockReturnValue(undefined),
			subscribe: vi.fn()
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			url: new URL('http://localhost/api/game/game-1/events?since=1.5')
		};

		const response = await GET(args as any);

		await new Promise((r) => setTimeout(r, 50));
		await response.body?.cancel();

		expect(mockManager.subscribe).toHaveBeenCalledWith('game-1', expect.anything());
	});

	// ─── Current input state ─────────────────────────────────────────────

	it('sends input-required immediately if engine is awaiting input', async () => {
		const entry = makeEntry({
			state: { step: 'ask', status: 'ongoing' as const, game: { players: [] } as any }
		});
		const fakeEngine = makeFakeEngine([entry]);

		const mockManager = mock<GameManager>({
			serialisationContext: {} as any,
			verifyParticipant: vi.fn().mockResolvedValue(undefined),
			getEngine: vi.fn().mockResolvedValue(fakeEngine),
			getInputState: vi.fn().mockReturnValue({
				awaitingPlayerId: 'plr1',
				fields: [{ name: 'confirm' }]
			}),
			subscribe: vi.fn()
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals()
		};

		const response = await GET(args as any);
		const events = await collectSSEEvents(response, 1);

		expect(events).toHaveLength(1);
		expect(events[0].event).toBe('input-required');
		expect((events[0].data as any).awaitingPlayerId).toBe('plr1');
		expect((events[0].data as any).fields).toEqual([{ name: 'confirm' }]);
	});

	// ─── Subscription ────────────────────────────────────────────────────

	it('subscribes to the GameManager for live updates', async () => {
		const fakeEngine = makeFakeEngine([]);

		const mockManager = mock<GameManager>({
			serialisationContext: {} as any,
			verifyParticipant: vi.fn().mockResolvedValue(undefined),
			getEngine: vi.fn().mockResolvedValue(fakeEngine),
			getInputState: vi.fn().mockReturnValue(undefined),
			subscribe: vi.fn()
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals()
		};

		const response = await GET(args as any);

		await new Promise((r) => setTimeout(r, 50));
		await response.body?.cancel();

		expect(mockManager.subscribe).toHaveBeenCalledTimes(1);
		expect(mockManager.subscribe).toHaveBeenCalledWith('game-1', expect.any(Object));
	});

	// ─── Disconnect ──────────────────────────────────────────────────────

	it('unsubscribes from the GameManager when the stream is cancelled', async () => {
		const fakeEngine = makeFakeEngine([]);
		let capturedSub: SSESubscriber | null = null;

		const mockManager = mock<GameManager>({
			serialisationContext: {} as any,
			verifyParticipant: vi.fn().mockResolvedValue(undefined),
			getEngine: vi.fn().mockResolvedValue(fakeEngine),
			getInputState: vi.fn().mockReturnValue(undefined),
			subscribe: vi.fn((_gameId: string, sub: SSESubscriber) => {
				capturedSub = sub;
			}),
			unsubscribe: vi.fn()
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals()
		};

		const response = await GET(args as any);

		// Wait for the stream to start
		await new Promise((r) => setTimeout(r, 50));

		expect(mockManager.subscribe).toHaveBeenCalledWith('game-1', capturedSub!);

		// Cancel the stream (simulating client disconnect)
		await response.body!.cancel();

		expect(mockManager.unsubscribe).toHaveBeenCalledWith('game-1', capturedSub!);
	});

	// ─── Stream isolation ────────────────────────────────────────────────

	it('each connection creates a unique subscriber', async () => {
		const fakeEngine = makeFakeEngine([]);
		const subscribers: SSESubscriber[] = [];

		const mockManager = mock<GameManager>({
			serialisationContext: {} as any,
			verifyParticipant: vi.fn().mockResolvedValue(undefined),
			getEngine: vi.fn().mockResolvedValue(fakeEngine),
			getInputState: vi.fn().mockReturnValue(undefined),
			subscribe: vi.fn((_gameId: string, sub: SSESubscriber) => {
				subscribers.push(sub);
			}),
			unsubscribe: vi.fn()
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals()
		};

		// Open two connections
		const response1 = await GET(args as any);
		const response2 = await GET(args as any);

		await new Promise((r) => setTimeout(r, 50));

		expect(subscribers).toHaveLength(2);
		expect(subscribers[0]).not.toBe(subscribers[1]);

		// Clean up
		await response1.body?.cancel();
		await response2.body?.cancel();
	});
});
