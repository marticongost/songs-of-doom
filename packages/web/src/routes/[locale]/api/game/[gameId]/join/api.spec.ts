/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConflictError, NotFoundError } from '$lib/server/errors';
import { mock } from '@songsofdoom/common/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const { mockGetGameManager, mockError, mockJson } = vi.hoisted(() => ({
	mockGetGameManager: vi.fn(),
	mockError: vi.fn((status: number, body: string) => {
		const err = new Error(body) as Error & { status: number; body: string };
		err.status = status;
		err.body = body;
		throw err;
	}),
	mockJson: vi.fn((data: unknown, init?: ResponseInit) => new Response(JSON.stringify(data), init))
}));

vi.mock('$lib/server/game-manager', () => ({
	getGameManager: mockGetGameManager
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

function makeRequest(body: unknown): Request {
	return new Request('http://localhost/api/game/game-1/join', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body)
	});
}

interface HandlerArgs {
	params: { gameId: string };
	locals: App.Locals;
	request: Request;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/game/[gameId]/join', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// ─── Authentication ──────────────────────────────────────────────────

	it('returns 401 when user is not authenticated', async () => {
		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: { user: null, session: null },
			request: makeRequest({ characterId: 1 })
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 401,
			message: 'Authentication required'
		});
	});

	// ─── Body validation ─────────────────────────────────────────────────

	it('returns 400 when body is not valid JSON', async () => {
		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: { user: { id: 'user-1', username: 'test' }, session: null },
			request: new Request('http://localhost/api/game/game-1/join', {
				method: 'POST',
				body: 'not-json'
			})
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 400,
			message: 'Invalid JSON body'
		});
	});

	it('returns 400 when characterId is missing', async () => {
		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: { user: { id: 'user-1', username: 'test' }, session: null },
			request: makeRequest({})
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 400,
			message: 'characterId must be an integer'
		});
	});

	it('returns 400 when characterId is not an integer', async () => {
		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: { user: { id: 'user-1', username: 'test' }, session: null },
			request: makeRequest({ characterId: 1.5 })
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 400,
			message: 'characterId must be an integer'
		});
	});

	// ─── Success ─────────────────────────────────────────────────────────

	it('returns 200 on successful join', async () => {
		const mockManager = mock<GameManager>({
			joinGame: vi.fn().mockResolvedValue(undefined)
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: { user: { id: 'user-1', username: 'test' }, session: null },
			request: makeRequest({ characterId: 2 })
		};

		const response = await POST(args as any);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ success: true });
		expect(mockManager.joinGame).toHaveBeenCalledWith('game-1', 'user-1', 2);
	});

	// ─── Error handling ──────────────────────────────────────────────────

	it('returns 404 when game or character is not found', async () => {
		const mockManager = mock<GameManager>({
			joinGame: vi.fn().mockRejectedValue(new NotFoundError('Game "game-1" not found'))
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: { user: { id: 'user-1', username: 'test' }, session: null },
			request: makeRequest({ characterId: 1 })
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 404,
			message: 'Game "game-1" not found'
		});
	});

	it('returns 409 on conflict', async () => {
		const mockManager = mock<GameManager>({
			joinGame: vi
				.fn()
				.mockRejectedValue(new ConflictError('User "user-1" is already a participant'))
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: { user: { id: 'user-1', username: 'test' }, session: null },
			request: makeRequest({ characterId: 1 })
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 409,
			message: 'User "user-1" is already a participant'
		});
	});

	it('re-throws unexpected errors', async () => {
		const mockManager = mock<GameManager>({
			joinGame: vi.fn().mockRejectedValue(new Error('Unexpected'))
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: { user: { id: 'user-1', username: 'test' }, session: null },
			request: makeRequest({ characterId: 1 })
		};

		await expect(POST(args as any)).rejects.toThrow('Unexpected');
	});
});
