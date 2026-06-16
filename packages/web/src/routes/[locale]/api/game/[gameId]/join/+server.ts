import { ConflictError, NotFoundError } from '$lib/server/errors';
import { getGameManager } from '$lib/server/game-manager';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface JoinRequest {
	characterId: number;
}

/**
 * POST /api/game/[gameId]/join
 *
 * Adds the current user (with the given character) as a participant in the game.
 */
export const POST: RequestHandler = async ({ params, locals, request }) => {
	if (!locals.user) {
		error(401, 'Authentication required');
	}

	const gameId = params.gameId;

	let body: JoinRequest;
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}

	if (typeof body.characterId !== 'number' || !Number.isInteger(body.characterId)) {
		error(400, 'characterId must be an integer');
	}

	const gameManager = getGameManager();
	try {
		await gameManager.joinGame(gameId, locals.user.id, body.characterId);
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
