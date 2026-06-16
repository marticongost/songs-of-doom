/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotFoundError } from '$lib/server/errors';
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
	return new Request('http://localhost/api/game', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body)
	});
}

interface HandlerArgs {
	locals: App.Locals;
	request: Request;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/game', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// ─── Authentication ──────────────────────────────────────────────────

	it('returns 401 when user is not authenticated', async () => {
		const args: HandlerArgs = {
			locals: { user: null, session: null },
			request: makeRequest({ campaignId: 'camp1', characterId: 1 })
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 401,
			message: 'Authentication required'
		});
	});

	// ─── Body validation ─────────────────────────────────────────────────

	it('returns 400 when body is not valid JSON', async () => {
		const args: HandlerArgs = {
			locals: { user: { id: 'user-1', username: 'test' }, session: null },
			request: new Request('http://localhost/api/game', {
				method: 'POST',
				body: 'not-json'
			})
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 400,
			message: 'Invalid JSON body'
		});
	});

	it('returns 400 when campaignId is missing', async () => {
		const args: HandlerArgs = {
			locals: { user: { id: 'user-1', username: 'test' }, session: null },
			request: makeRequest({ characterId: 1 })
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 400,
			message: 'campaignId must be a non-empty string'
		});
	});

	it('returns 400 when campaignId is an empty string', async () => {
		const args: HandlerArgs = {
			locals: { user: { id: 'user-1', username: 'test' }, session: null },
			request: makeRequest({ campaignId: '   ', characterId: 1 })
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 400,
			message: 'campaignId must be a non-empty string'
		});
	});

	it('returns 400 when campaignId is not a string', async () => {
		const args: HandlerArgs = {
			locals: { user: { id: 'user-1', username: 'test' }, session: null },
			request: makeRequest({ campaignId: 123, characterId: 1 })
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 400,
			message: 'campaignId must be a non-empty string'
		});
	});

	it('returns 400 when characterId is missing', async () => {
		const args: HandlerArgs = {
			locals: { user: { id: 'user-1', username: 'test' }, session: null },
			request: makeRequest({ campaignId: 'camp1' })
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 400,
			message: 'characterId must be an integer'
		});
	});

	it('returns 400 when characterId is not an integer', async () => {
		const args: HandlerArgs = {
			locals: { user: { id: 'user-1', username: 'test' }, session: null },
			request: makeRequest({ campaignId: 'camp1', characterId: 1.5 })
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 400,
			message: 'characterId must be an integer'
		});
	});

	// ─── Success ─────────────────────────────────────────────────────────

	it('returns 201 with gameId on successful creation', async () => {
		const mockManager = mock<GameManager>({
			createGame: vi.fn().mockResolvedValue('game-1')
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			locals: { user: { id: 'user-1', username: 'test' }, session: null },
			request: makeRequest({ campaignId: 'camp1', characterId: 1 })
		};

		const response = await POST(args as any);
		expect(response.status).toBe(201);
		expect(await response.json()).toEqual({ gameId: 'game-1' });
		expect(mockManager.createGame).toHaveBeenCalledWith('user-1', 'camp1', 1);
	});

	// ─── Error handling ─────────────────────────────────────────────────

	it('returns 404 when campaign or character is not found', async () => {
		const mockManager = mock<GameManager>({
			createGame: vi.fn().mockRejectedValue(new NotFoundError('Campaign "camp1" not found'))
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			locals: { user: { id: 'user-1', username: 'test' }, session: null },
			request: makeRequest({ campaignId: 'camp1', characterId: 1 })
		};

		await expect(POST(args as any)).rejects.toMatchObject({
			status: 404,
			message: 'Campaign "camp1" not found'
		});
	});

	it('re-throws unexpected errors', async () => {
		const mockManager = mock<GameManager>({
			createGame: vi.fn().mockRejectedValue(new Error('Unexpected'))
		});
		mockGetGameManager.mockReturnValue(mockManager);

		const args: HandlerArgs = {
			locals: { user: { id: 'user-1', username: 'test' }, session: null },
			request: makeRequest({ campaignId: 'camp1', characterId: 1 })
		};

		await expect(POST(args as any)).rejects.toThrow('Unexpected');
	});
});
