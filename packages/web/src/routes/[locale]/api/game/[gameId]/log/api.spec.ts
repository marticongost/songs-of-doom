/* eslint-disable @typescript-eslint/no-explicit-any */
import { mock } from '@songsofdoom/common/test-utils';
import { ProcedureId } from '@songsofdoom/engine';
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

import type { GameManager, LogEntry } from '$lib/server/game-manager';
import { GET } from './+server';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface HandlerArgs {
	params: { gameId: string };
	locals: App.Locals;
	url?: URL;
}

/** Minimal authenticated locals helper. */
function authenticatedLocals(): App.Locals {
	return { user: { id: 'user-1', username: 'test' }, session: null };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/game/[gameId]/log', () => {
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

	// ─── Success ─────────────────────────────────────────────────────────

	it('returns the full journal log without full game state', async () => {
		const log: LogEntry[] = [
			{
				procedureId: ProcedureId.RunCampaign,
				parentIndex: undefined,
				state: { step: 'start', status: 'complete' as const }
			}
		];

		const mockManager = mock<GameManager>({
			verifyParticipant: vi.fn().mockResolvedValue(undefined),
			getGameLog: vi.fn().mockResolvedValue(log)
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = { params: { gameId: 'game-1' }, locals: authenticatedLocals() };

		const response = await GET(args as any);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ log });
		expect(mockManager.verifyParticipant).toHaveBeenCalledWith('game-1', 'user-1');
		expect(mockManager.getGameLog).toHaveBeenCalledWith('game-1', undefined);
	});

	it('returns an empty log for a game with no entries', async () => {
		const mockManager = mock<GameManager>({
			verifyParticipant: vi.fn().mockResolvedValue(undefined),
			getGameLog: vi.fn().mockResolvedValue([])
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = { params: { gameId: 'game-1' }, locals: authenticatedLocals() };

		const response = await GET(args as any);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ log: [] });
		expect(mockManager.getGameLog).toHaveBeenCalledWith('game-1', undefined);
	});

	// ─── Incremental fetch with ?since= ──────────────────────────────────

	it('returns only entries after the since index when ?since= is provided', async () => {
		const log: LogEntry[] = [
			{
				procedureId: ProcedureId.RunCampaign,
				parentIndex: undefined,
				state: { step: 'chapter2', status: 'ongoing' as const }
			}
		];

		const mockManager = mock<GameManager>({
			verifyParticipant: vi.fn().mockResolvedValue(undefined),
			getGameLog: vi.fn().mockResolvedValue(log)
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			url: new URL('http://localhost/api/game/game-1/log?since=5')
		};

		const response = await GET(args as any);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ log });
		expect(mockManager.getGameLog).toHaveBeenCalledWith('game-1', 5);
	});

	it('returns empty log when since is beyond the last entry', async () => {
		const mockManager = mock<GameManager>({
			verifyParticipant: vi.fn().mockResolvedValue(undefined),
			getGameLog: vi.fn().mockResolvedValue([])
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			params: { gameId: 'game-1' },
			locals: authenticatedLocals(),
			url: new URL('http://localhost/api/game/game-1/log?since=999')
		};

		const response = await GET(args as any);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ log: [] });
		expect(mockManager.getGameLog).toHaveBeenCalledWith('game-1', 999);
	});
});
