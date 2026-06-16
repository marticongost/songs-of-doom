/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const { mockCheckVersion } = vi.hoisted(() => ({
	mockCheckVersion: vi.fn().mockReturnValue({ type: 'match' as const })
}));

vi.mock('@emotion/css', () => ({
	cache: { key: 'css', insert: vi.fn() }
}));

vi.mock('@emotion/server/create-instance', () => ({
	default: vi.fn(() => ({
		extractCritical: vi.fn(() => ({ css: '', ids: [] }))
	}))
}));

vi.mock('$lib/server/auth', () => ({
	getSessionIdFromCookie: vi.fn(() => null),
	validateSession: vi.fn(),
	setSessionCookie: vi.fn(),
	deleteSessionCookie: vi.fn()
}));

vi.mock('$lib/server/version-check', () => ({
	checkVersion: mockCheckVersion
}));

// ---------------------------------------------------------------------------
// Subject under test
// ---------------------------------------------------------------------------

import { versionCheckHandle } from './hooks.server';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal SvelteKit event with just the fields needed by the hook. */
function makeEvent(pathname: string): any {
	return {
		url: new URL(`http://localhost${pathname}`),
		request: new Request(`http://localhost${pathname}`)
	};
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('versionCheckHandle', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockCheckVersion.mockReturnValue({ type: 'match' as const });
	});

	// ─── Non-API routes pass through ────────────────────────────────────

	it('passes through non-API routes', async () => {
		const event = makeEvent('/ca/characters');
		const resolve = vi.fn().mockResolvedValue(new Response('ok'));

		await versionCheckHandle({ event, resolve } as any);

		expect(resolve).toHaveBeenCalledWith(event);
	});

	it('passes through non-API routes without /api prefix', async () => {
		const event = makeEvent('/ca/health');
		const resolve = vi.fn().mockResolvedValue(new Response('ok'));

		await versionCheckHandle({ event, resolve } as any);

		expect(resolve).toHaveBeenCalledWith(event);
	});

	// ─── Game routes with matching version ───────────────────────────────

	it('passes through game routes when version matches', async () => {
		const event = makeEvent('/ca/api/game/abc123');
		const resolve = vi.fn().mockResolvedValue(new Response('ok'));

		await versionCheckHandle({ event, resolve } as any);

		expect(resolve).toHaveBeenCalledWith(event);
	});

	it('passes through the game root endpoint when version matches', async () => {
		const event = makeEvent('/ca/api/game');
		const resolve = vi.fn().mockResolvedValue(new Response('ok'));

		await versionCheckHandle({ event, resolve } as any);

		expect(resolve).toHaveBeenCalledWith(event);
	});

	// ─── Game routes with mismatched version ─────────────────────────────

	it('returns 409 on version mismatch for game routes', async () => {
		const mismatchResponse = new Response(JSON.stringify({ requiredVersion: 'abc123' }), {
			status: 409
		});
		mockCheckVersion.mockReturnValue({ type: 'mismatch', response: mismatchResponse });

		const event = makeEvent('/ca/api/game/abc123');
		const resolve = vi.fn();

		const response = await versionCheckHandle({ event, resolve } as any);

		expect(response.status).toBe(409);
		expect(await response.json()).toEqual({ requiredVersion: 'abc123' });
		expect(resolve).not.toHaveBeenCalled();
	});

	it('returns 409 on version mismatch for the game root endpoint', async () => {
		const mismatchResponse = new Response(JSON.stringify({ requiredVersion: 'xyz' }), {
			status: 409
		});
		mockCheckVersion.mockReturnValue({ type: 'mismatch', response: mismatchResponse });

		const event = makeEvent('/ca/api/game');
		const resolve = vi.fn();

		const response = await versionCheckHandle({ event, resolve } as any);

		expect(response.status).toBe(409);
		expect(resolve).not.toHaveBeenCalled();
	});
});
