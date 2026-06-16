/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConflictError, NotFoundError } from '$lib/server/errors';
import { mock } from '@songsofdoom/common/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPrisma = vi.hoisted(() => ({
	game: {
		findUnique: vi.fn()
	}
}));

const { mockGetGameManager, mockCheckVersion, mockError, mockJson } = vi.hoisted(() => ({
	mockGetGameManager: vi.fn(),
	mockCheckVersion: vi.fn().mockReturnValue({ type: 'match' as const }),
	mockError: vi.fn((status: number, body: string) => {
		const err = new Error(body) as Error & { status: number; body: string };
		err.status = status;
		err.body = body;
		throw err;
	}),
	mockJson: vi.fn((data: unknown, init?: ResponseInit) => new Response(JSON.stringify(data), init))
}));

vi.mock('$lib/server/db', () => ({
	prisma: mockPrisma
}));

vi.mock('$lib/server/game-manager', () => ({
	getGameManager: mockGetGameManager
}));

vi.mock('$lib/server/version-check', () => ({
	checkVersion: mockCheckVersion
}));

vi.mock('@sveltejs/kit', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@sveltejs/kit')>();
	return { ...actual, error: mockError, json: mockJson };
});

// ---------------------------------------------------------------------------
// Subject under test
// ---------------------------------------------------------------------------

import type { GameManager } from '$lib/server/game-manager';
import { POST } from './+server';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body: unknown, opts?: { version?: string }): Request {
	return new Request('http://localhost/api/game/game-1/input', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			...(opts?.version ? { 'Game-Client-Version': opts.version } : {})
		},
		body: JSON.stringify(body)
	});
}

interface HandlerArgs {
	params: { gameId: string };
	locals: App.Locals;
	request: Request;
}

/** Minimal authenticated locals helper. */
function authenticatedLocals(): App.Locals {
	return { user: { id: 'user-1', username: 'test' }, session: null };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/game/[gameId]/input', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Restore the default version-match behaviour (clearAllMocks resets it).
		mockCheckVersion.mockReturnValue({ type: 'match' as const });
	});

	// ─── Authentication ──────────────────────────────────────────────────

	it('returns 401 when user is not authenticated', async () => {
		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: { user: null, session: null },
			request: makeRequest({})
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 401,
			message: 'Authentication required'
		});
	});

	// ─── Version check ───────────────────────────────────────────────────

	it('returns 409 with version mismatch response', async () => {
		const mismatchResponse = new Response(JSON.stringify({ requiredVersion: 'abc123' }), {
			status: 409
		});
		mockCheckVersion.mockReturnValue({ type: 'mismatch', response: mismatchResponse });

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			request: makeRequest({})
		};

		const response = await POST(args as any);
		expect(response.status).toBe(409);
		expect(await response.json()).toEqual({ requiredVersion: 'abc123' });
	});

	// ─── Body validation ─────────────────────────────────────────────────

	it('returns 400 when body is not valid JSON', async () => {
		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			request: new Request('http://localhost/api/game/game-1/input', {
				method: 'POST',
				body: 'not-json'
			})
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 400,
			message: 'Invalid JSON body'
		});
	});

	it('returns 400 when body is null', async () => {
		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			request: makeRequest(null)
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 400,
			message: 'Body must be a JSON object'
		});
	});

	it('returns 400 when body is an array', async () => {
		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			request: makeRequest([])
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 400,
			message: 'Body must be a JSON object'
		});
	});

	it('returns 400 when body is a string', async () => {
		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			request: makeRequest('some-string')
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 400,
			message: 'Body must be a JSON object'
		});
	});

	// ─── Game lookup ─────────────────────────────────────────────────────

	it('returns 404 when game is not found in the database', async () => {
		mockPrisma.game.findUnique.mockResolvedValue(null);

		const args: HandlerArgs = {
			params: { gameId: 'nonexistent' },
			locals: authenticatedLocals(),
			request: makeRequest({})
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 404,
			message: 'Game "nonexistent" not found'
		});
	});

	// ─── Participant verification ────────────────────────────────────────

	it('returns 403 when user is not a participant', async () => {
		mockPrisma.game.findUnique.mockResolvedValue({
			id: 'game-1',
			participants: [{ userId: 'other-user' }]
		});

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			request: makeRequest({ action: 'move' })
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 403,
			message: 'You are not a participant in this game'
		});
	});

	// ─── Input state (engine awaiting input) ─────────────────────────────

	it('returns 409 when engine is not awaiting input', async () => {
		mockPrisma.game.findUnique.mockResolvedValue({
			id: 'game-1',
			participants: [{ userId: 'user-1' }]
		});

		const mockManager = mock<GameManager>({
			getInputState: vi.fn().mockReturnValue(undefined)
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			request: makeRequest({ action: 'move' })
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 409,
			message: 'The engine is not currently awaiting input'
		});
	});

	// ─── Turn verification ───────────────────────────────────────────────

	it('returns 409 when it is not the requesting player turn', async () => {
		mockPrisma.game.findUnique.mockResolvedValue({
			id: 'game-1',
			participants: [{ userId: 'user-1' }, { userId: 'user-2' }]
		});

		const mockManager = mock<GameManager>({
			getInputState: vi.fn().mockReturnValue({
				awaitingPlayerId: 'plr2',
				fields: []
			}),
			supplyInput: vi.fn()
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			request: makeRequest({ action: 'move' })
		};

		// user-1 is first participant → plr1, but awaiting is plr2
		await expect(POST(args as any)).rejects.toMatchObject({
			status: 409,
			message: 'It is not your turn. Waiting for plr2'
		});
	});

	// ─── Success ─────────────────────────────────────────────────────────

	it('returns 204 and supplies input when the player is eligible', async () => {
		mockPrisma.game.findUnique.mockResolvedValue({
			id: 'game-1',
			// user-1 is the second participant → plr2, which matches awaitingPlayerId
			participants: [{ userId: 'user-2' }, { userId: 'user-1' }]
		});

		const mockManager = mock<GameManager>({
			getInputState: vi.fn().mockReturnValue({
				awaitingPlayerId: 'plr2',
				fields: []
			}),
			supplyInput: vi.fn().mockResolvedValue(undefined)
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const inputBody = { action: 'attack', target: 'enemy-1' };
		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: { user: { id: 'user-1', username: 'test' }, session: null },
			request: makeRequest(inputBody)
		};

		const response = await POST(args as any);
		expect(response.status).toBe(204);
		expect(response.body).toBeNull();
		expect(mockManager.supplyInput).toHaveBeenCalledWith('game-1', inputBody);
	});

	it('returns 204 when user is the sole participant (plr1)', async () => {
		mockPrisma.game.findUnique.mockResolvedValue({
			id: 'game-1',
			participants: [{ userId: 'user-1' }]
		});

		const mockManager = mock<GameManager>({
			getInputState: vi.fn().mockReturnValue({
				awaitingPlayerId: 'plr1',
				fields: []
			}),
			supplyInput: vi.fn().mockResolvedValue(undefined)
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			request: makeRequest({ action: 'skip' })
		};

		const response = await POST(args as any);
		expect(response.status).toBe(204);
		expect(mockManager.supplyInput).toHaveBeenCalledWith('game-1', { action: 'skip' });
	});

	// ─── Error handling from supplyInput ─────────────────────────────────

	it('returns 404 when supplyInput throws NotFoundError', async () => {
		mockPrisma.game.findUnique.mockResolvedValue({
			id: 'game-1',
			participants: [{ userId: 'user-1' }]
		});

		const mockManager = mock<GameManager>({
			getInputState: vi.fn().mockReturnValue({
				awaitingPlayerId: 'plr1',
				fields: []
			}),
			supplyInput: vi.fn().mockRejectedValue(new NotFoundError('Game "game-1" not found'))
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			request: makeRequest({ action: 'move' })
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 404,
			message: 'Game "game-1" not found'
		});
	});

	it('returns 409 when supplyInput throws ConflictError', async () => {
		mockPrisma.game.findUnique.mockResolvedValue({
			id: 'game-1',
			participants: [{ userId: 'user-1' }]
		});

		const mockManager = mock<GameManager>({
			getInputState: vi.fn().mockReturnValue({
				awaitingPlayerId: 'plr1',
				fields: []
			}),
			supplyInput: vi.fn().mockRejectedValue(new ConflictError('Invalid input'))
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			request: makeRequest({ action: 'move' })
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 409,
			message: 'Invalid input'
		});
	});

	it('re-throws unexpected errors from supplyInput', async () => {
		mockPrisma.game.findUnique.mockResolvedValue({
			id: 'game-1',
			participants: [{ userId: 'user-1' }]
		});

		const mockManager = mock<GameManager>({
			getInputState: vi.fn().mockReturnValue({
				awaitingPlayerId: 'plr1',
				fields: []
			}),
			supplyInput: vi.fn().mockRejectedValue(new Error('Unexpected engine crash'))
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			request: makeRequest({ action: 'move' })
		};

		await expect(POST(args as any)).rejects.toThrow('Unexpected engine crash');
	});
});
