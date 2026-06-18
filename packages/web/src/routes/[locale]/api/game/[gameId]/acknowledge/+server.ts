import { ForbiddenError, NotFoundError } from '$lib/server/errors';
import { getGameManager } from '$lib/server/game-manager';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// ---------------------------------------------------------------------------
// POST /api/game/[gameId]/acknowledge
// ---------------------------------------------------------------------------

/**
 * Advances the current player's acknowledged journal index for narration
 * gating.
 *
 * The body must contain `{ index: number }` — the journal index of the
 * narration entry the player has just acknowledged.
 *
 * Returns `204 No Content` on success.
 */
export const POST: RequestHandler = async ({ params, locals, request }) => {
	// --- Authentication ---
	if (!locals.user) {
		error(401, 'Authentication required');
	}

	const gameId = params.gameId;

	// --- Parse body ---
	let body: { index: unknown };
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}

	if (typeof body !== 'object' || body === null || typeof body.index !== 'number') {
		error(400, 'Body must be { index: number }');
	}

	// --- Verify participation ---
	const gameManager = getGameManager();
	try {
		await gameManager.verifyParticipant(gameId, locals.user.id);
	} catch (err) {
		if (err instanceof NotFoundError) {
			error(404, err.message);
		}
		if (err instanceof ForbiddenError) {
			error(403, err.message);
		}
		throw err;
	}

	await gameManager.acknowledgeNarration(gameId, locals.user.id, body.index);

	return new Response(null, { status: 204 });
};
