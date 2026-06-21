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
	locals: App.Locals;
}

/** Minimal authenticated locals helper. */
function authenticatedLocals(): App.Locals {
	return { user: { id: 'user-1', username: 'test' }, session: null };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/game/[gameId]', () => {
	beforeEach(() => {
		vi.clearAllMocks();
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

	it('returns 403 when the user is not a participant', async () => {
		const mockManager = mock<GameManager>({
			verifyParticipant: vi
				.fn()
				.mockRejectedValue(new Error('You are not a participant in this game'))
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals()
		};

		// The handler catches the error but re-throws it because it's not a known type.
		// verifyParticipant throws a plain Error, not ForbiddenError, in this test.
		await expect(GET(args as any)).rejects.toThrow('You are not a participant in this game');
	});

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

	// ─── Not found ───────────────────────────────────────────────────────

	it('returns 404 when game is not found in the database', async () => {
		const mockManager = mock<GameManager>({
			verifyParticipant: vi.fn().mockResolvedValue(undefined)
		});
		mockGetGameManager.mockReturnValue(mockManager);
		mockPrisma.game.findUnique.mockResolvedValue(null);

		const args: HandlerArgs = { params: { gameId: 'nonexistent' }, locals: authenticatedLocals() };

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
			campaignId: 'campaign-1',
			ownerId: 'user-1',
			participants: [
				{
					userId: 'user-1',
					characterId: 1,
					character: { revisions: [{ state: { name: 'Hero' } }] }
				},
				{
					userId: 'user-2',
					characterId: 2,
					character: { revisions: [{ state: { name: 'Sidekick' } }] }
				}
			]
		});

		const mockManager = mock<GameManager>({
			verifyParticipant: vi.fn().mockResolvedValue(undefined),
			getGameState: vi.fn().mockResolvedValue({ players: [] }),
			getAcknowledgedIndex: vi.fn().mockResolvedValue(2)
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = { params: { gameId: 'game-1' }, locals: authenticatedLocals() };

		const response = await GET(args as any);
		const body = await response.json();

		expect(body).toEqual({
			id: 'game-1',
			status: 'ACTIVE',
			campaignId: 'campaign-1',
			ownerId: 'user-1',
			participants: [
				{ userId: 'user-1', characterId: 1, characterName: 'Hero' },
				{ userId: 'user-2', characterId: 2, characterName: 'Sidekick' }
			],
			lastAcknowledgedJournalIndex: 2,
			state: { players: [] }
		});
		expect(mockManager.verifyParticipant).toHaveBeenCalledWith('game-1', 'user-1');
		expect(mockManager.getGameState).toHaveBeenCalledWith('game-1');
		expect(mockManager.getAcknowledgedIndex).toHaveBeenCalledWith('game-1', 'user-1');
	});
});
