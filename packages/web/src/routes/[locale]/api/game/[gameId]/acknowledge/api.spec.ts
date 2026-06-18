/* eslint-disable @typescript-eslint/no-explicit-any */
import { ForbiddenError, NotFoundError } from '$lib/server/errors';
import { mock } from '@songsofdoom/common/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const { mockGetGameManager, mockError } = vi.hoisted(() => ({
	mockGetGameManager: vi.fn(),
	mockError: vi.fn((status: number, body: string) => {
		const err = new Error(body) as Error & { status: number; body: string };
		err.status = status;
		err.body = body;
		throw err;
	})
}));

vi.mock('$lib/server/game-manager', () => ({
	getGameManager: mockGetGameManager
}));

vi.mock('@sveltejs/kit', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@sveltejs/kit')>();
	return { ...actual, error: mockError };
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
	return new Request('http://localhost/api/game/game-1/acknowledge', {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
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

describe('POST /api/game/[gameId]/acknowledge', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// ─── Authentication ──────────────────────────────────────────────────

	it('returns 401 when user is not authenticated', async () => {
		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: { user: null, session: null },
			request: makeRequest({ index: 0 })
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
			locals: authenticatedLocals(),
			request: new Request('http://localhost/api/game/game-1/acknowledge', {
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
			message: 'Body must be { index: number }'
		});
	});

	it('returns 400 when body has no index', async () => {
		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			request: makeRequest({})
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 400,
			message: 'Body must be { index: number }'
		});
	});

	it('returns 400 when index is not a number', async () => {
		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			request: makeRequest({ index: 'abc' })
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 400,
			message: 'Body must be { index: number }'
		});
	});

	// ─── Participation verification ──────────────────────────────────────

	it('returns 404 when the game is not found', async () => {
		const mockManager = mock<GameManager>({
			verifyParticipant: vi.fn().mockRejectedValue(new NotFoundError('Game "game-1" not found'))
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			request: makeRequest({ index: 3 })
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 404,
			message: 'Game "game-1" not found'
		});
	});

	it('returns 403 when the user is not a participant', async () => {
		const mockManager = mock<GameManager>({
			verifyParticipant: vi
				.fn()
				.mockRejectedValue(new ForbiddenError('You are not a participant in this game'))
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			request: makeRequest({ index: 3 })
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 403,
			message: 'You are not a participant in this game'
		});
	});

	// ─── Success ─────────────────────────────────────────────────────────

	it('returns 204 and acknowledges the narration', async () => {
		const mockManager = mock<GameManager>({
			verifyParticipant: vi.fn().mockResolvedValue(undefined),
			acknowledgeNarration: vi.fn().mockResolvedValue(undefined)
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			request: makeRequest({ index: 5 })
		};

		const response = await POST(args as any);
		expect(response.status).toBe(204);
		expect(response.body).toBeNull();
		expect(mockManager.acknowledgeNarration).toHaveBeenCalledWith('game-1', 'user-1', 5);
	});
});
