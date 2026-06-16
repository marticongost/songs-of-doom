import { NotFoundError } from '$lib/server/errors';
import { getGameManager } from '$lib/server/game-manager';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface CreateGameRequest {
	campaignId: string;
	characterId: number;
}

/**
 * POST /api/game
 *
 * Creates a new game in PREPARATION state with the chosen campaign and
 * automatically adds the creator as the first participant.
 */
export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) {
		error(401, 'Authentication required');
	}

	let body: CreateGameRequest;
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}

	if (typeof body.campaignId !== 'string' || body.campaignId.trim().length === 0) {
		error(400, 'campaignId must be a non-empty string');
	}

	if (typeof body.characterId !== 'number' || !Number.isInteger(body.characterId)) {
		error(400, 'characterId must be an integer');
	}

	const gameManager = getGameManager();
	try {
		const gameId = await gameManager.createGame(locals.user.id, body.campaignId, body.characterId);
		return json({ gameId }, { status: 201 });
	} catch (err) {
		if (err instanceof NotFoundError) {
			error(404, err.message);
		}
		throw err;
	}
};
