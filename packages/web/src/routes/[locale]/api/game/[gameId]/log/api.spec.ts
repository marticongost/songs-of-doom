/* eslint-disable @typescript-eslint/no-explicit-any */
import { mock } from '@songsofdoom/common/test-utils';
import { ProcedureId } from '@songsofdoom/engine';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const { mockGetGameManager, mockJson } = vi.hoisted(() => ({
	mockGetGameManager: vi.fn(),
	mockJson: vi.fn((data: unknown, init?: ResponseInit) => new Response(JSON.stringify(data), init))
}));

vi.mock('$lib/server/game-manager', () => ({
	getGameManager: mockGetGameManager
}));

vi.mock('@sveltejs/kit', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@sveltejs/kit')>();
	return { ...actual, json: mockJson };
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
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/game/[gameId]/log', () => {
	beforeEach(() => {
		vi.clearAllMocks();
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
			getGameLog: vi.fn().mockResolvedValue(log)
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = { params: { gameId: 'game-1' } };

		const response = await GET(args as any);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ log });
		expect(mockManager.getGameLog).toHaveBeenCalledWith('game-1');
	});

	it('returns an empty log for a game with no entries', async () => {
		const mockManager = mock<GameManager>({
			getGameLog: vi.fn().mockResolvedValue([])
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = { params: { gameId: 'game-1' } };

		const response = await GET(args as any);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ log: [] });
	});
});
