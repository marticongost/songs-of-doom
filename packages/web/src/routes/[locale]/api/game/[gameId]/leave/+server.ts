import { ConflictError, NotFoundError } from '$lib/server/errors';
import { getGameManager } from '$lib/server/game-manager';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * POST /api/game/[gameId]/leave
 *
 * Removes the current user from the game (only in PREPARATION state).
 */
export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		error(401, 'Authentication required');
	}

	const gameId = params.gameId;

	const gameManager = getGameManager();
	try {
		await gameManager.leaveGame(gameId, locals.user.id);
		return json({ success: true }, { status: 200 });
	} catch (err) {
		if (err instanceof NotFoundError) {
			error(404, err.message);
		}
		if (err instanceof ConflictError) {
			error(409, err.message);
		}
		throw err;
	}
};
