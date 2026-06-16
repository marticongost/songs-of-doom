import { ForbiddenError, NotFoundError } from '$lib/server/errors';
import { getGameManager } from '$lib/server/game-manager';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * GET /api/game/[gameId]/state/[index]
 *
 * Returns the game state at a specific journal entry index.
 * Supports negative indices (count from the back), useful for undo/redo.
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		error(401, 'Authentication required');
	}

	const gameId = params.gameId;
	const rawIndex = params.index;
	const index = parseInt(rawIndex, 10);

	if (isNaN(index)) {
		error(400, `Invalid journal index: "${rawIndex}"`);
	}

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

	const state = await gameManager.getGameStateAtIndex(gameId, index);
	if (!state) {
		error(404, 'No journal entries found for this game');
	}
	return json({ index, state });
};
