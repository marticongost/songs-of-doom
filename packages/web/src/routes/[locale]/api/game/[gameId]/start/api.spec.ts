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

interface HandlerArgs {
	params: { gameId: string };
	locals: App.Locals;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/game/[gameId]/start', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// ─── Authentication ──────────────────────────────────────────────────

	it('returns 401 when user is not authenticated', async () => {
		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: { user: null, session: null }
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 401,
			message: 'Authentication required'
		});
	});

	// ─── Success ─────────────────────────────────────────────────────────

	it('returns 200 on successful game start', async () => {
		const mockManager = mock<GameManager>({
			startGame: vi.fn().mockResolvedValue(undefined)
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: { user: { id: 'user-1', username: 'test' }, session: null }
		};

		const response = await POST(args as any);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ success: true });
		expect(mockManager.startGame).toHaveBeenCalledWith('game-1');
	});

	// ─── Error handling ──────────────────────────────────────────────────

	it('returns 404 when game is not found', async () => {
		const mockManager = mock<GameManager>({
			startGame: vi.fn().mockRejectedValue(new NotFoundError('Game "game-1" not found'))
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: { user: { id: 'user-1', username: 'test' }, session: null }
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 404,
			message: 'Game "game-1" not found'
		});
	});

	it('returns 409 when game is not in PREPARATION state', async () => {
		const mockManager = mock<GameManager>({
			startGame: vi
				.fn()
				.mockRejectedValue(new ConflictError('Game "game-1" is not in PREPARATION state'))
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: { user: { id: 'user-1', username: 'test' }, session: null }
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 409,
			message: 'Game "game-1" is not in PREPARATION state'
		});
	});

	it('re-throws unexpected errors', async () => {
		const mockManager = mock<GameManager>({
			startGame: vi.fn().mockRejectedValue(new Error('Unexpected'))
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: { user: { id: 'user-1', username: 'test' }, session: null }
		};

		await expect(POST(args as any)).rejects.toThrow('Unexpected');
	});
});
