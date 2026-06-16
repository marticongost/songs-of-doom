import { ConflictError, NotFoundError } from '$lib/server/errors';
import { getGameManager } from '$lib/server/game-manager';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * POST /api/game/[gameId]/start
 *
 * Starts the game using the campaign chosen at creation time.
 * The engine is created and run, pausing at the first InputStep if the game requires player input.
 */
export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		error(401, 'Authentication required');
	}

	const gameId = params.gameId;

	const gameManager = getGameManager();
	try {
		await gameManager.startGame(gameId);
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
