/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { GET } from './+server';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface HandlerArgs {
	params: { gameId: string; index: string };
	locals: App.Locals;
}

/** Minimal authenticated locals helper. */
function authenticatedLocals(): App.Locals {
	return { user: { id: 'user-1', username: 'test' }, session: null };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/game/[gameId]/state/[index]', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// ─── Authentication ──────────────────────────────────────────────────

	it('returns 401 when user is not authenticated', async () => {
		const args: HandlerArgs = {
			params: { gameId: 'game-1', index: '0' },
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
			params: { gameId: 'game-1', index: '0' },
			locals: authenticatedLocals()
		};

		await expect(GET(args as any)).rejects.toMatchObject({
			status: 404,
			message: 'Game "game-1" not found'
		});
	});

	// ─── Index validation ────────────────────────────────────────────────

	it('returns 400 when index is not a number', async () => {
		const mockManager = mock<GameManager>({
			verifyParticipant: vi.fn().mockResolvedValue(undefined)
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1', index: 'abc' },
			locals: authenticatedLocals()
		};

		await expect(GET(args as any)).rejects.toMatchObject({
			status: 400,
			message: 'Invalid journal index: "abc"'
		});
	});

	it('returns 400 when index is an empty string', async () => {
		const mockManager = mock<GameManager>({
			verifyParticipant: vi.fn().mockResolvedValue(undefined)
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1', index: '' },
			locals: authenticatedLocals()
		};

		await expect(GET(args as any)).rejects.toMatchObject({
			status: 400,
			message: 'Invalid journal index: ""'
		});
	});

	// ─── Not found ───────────────────────────────────────────────────────

	it('returns 404 when there are no journal entries', async () => {
		const mockManager = mock<GameManager>({
			verifyParticipant: vi.fn().mockResolvedValue(undefined),
			getGameStateAtIndex: vi.fn().mockResolvedValue(null)
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1', index: '0' },
			locals: authenticatedLocals()
		};

		await expect(GET(args as any)).rejects.toMatchObject({
			status: 404,
			message: 'No journal entries found for this game'
		});
	});

	// ─── Success ─────────────────────────────────────────────────────────

	it('returns state at a valid positive index', async () => {
		const mockManager = mock<GameManager>({
			verifyParticipant: vi.fn().mockResolvedValue(undefined),
			getGameStateAtIndex: vi.fn().mockResolvedValue({ players: [{ id: 'p1' }] })
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1', index: '2' },
			locals: authenticatedLocals()
		};

		const response = await GET(args as any);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			index: 2,
			state: { players: [{ id: 'p1' }] }
		});
		expect(mockManager.verifyParticipant).toHaveBeenCalledWith('game-1', 'user-1');
		expect(mockManager.getGameStateAtIndex).toHaveBeenCalledWith('game-1', 2);
	});

	it('returns state at a valid negative index', async () => {
		const mockManager = mock<GameManager>({
			verifyParticipant: vi.fn().mockResolvedValue(undefined),
			getGameStateAtIndex: vi.fn().mockResolvedValue({ players: [] })
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1', index: '-1' },
			locals: authenticatedLocals()
		};

		const response = await GET(args as any);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			index: -1,
			state: { players: [] }
		});
		expect(mockManager.verifyParticipant).toHaveBeenCalledWith('game-1', 'user-1');
		expect(mockManager.getGameStateAtIndex).toHaveBeenCalledWith('game-1', -1);
	});
});
