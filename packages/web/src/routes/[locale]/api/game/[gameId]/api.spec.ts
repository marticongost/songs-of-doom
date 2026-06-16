/* eslint-disable @typescript-eslint/no-explicit-any */
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

vi.mock('$lib/server/db', () => ({
	prisma: mockPrisma
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
	params: { gameId: string };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/game/[gameId]', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// ─── Not found ───────────────────────────────────────────────────────

	it('returns 404 when game is not found in the database', async () => {
		mockPrisma.game.findUnique.mockResolvedValue(null);

		const args: HandlerArgs = { params: { gameId: 'nonexistent' } };

		await expect(GET(args as any)).rejects.toMatchObject({
			status: 404,
			message: 'Game "nonexistent" not found'
		});
	});

	// ─── Success ─────────────────────────────────────────────────────────

	it('returns game info with its current state snapshot', async () => {
		mockPrisma.game.findUnique.mockResolvedValue({
			id: 'game-1',
			status: 'ACTIVE',
			participants: [
				{ userId: 'user-1', characterId: 1 },
				{ userId: 'user-2', characterId: 2 }
			]
		});

		const mockManager = mock<GameManager>({
			getGameState: vi.fn().mockResolvedValue({ players: [] })
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = { params: { gameId: 'game-1' } };

		const response = await GET(args as any);
		const body = await response.json();

		expect(body).toEqual({
			id: 'game-1',
			status: 'ACTIVE',
			participants: [
				{ userId: 'user-1', characterId: 1 },
				{ userId: 'user-2', characterId: 2 }
			],
			state: { players: [] }
		});
		expect(mockManager.getGameState).toHaveBeenCalledWith('game-1');
	});
});
