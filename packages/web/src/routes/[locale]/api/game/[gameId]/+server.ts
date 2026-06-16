import { prisma } from '$lib/server/db';
import { ForbiddenError, NotFoundError } from '$lib/server/errors';
import { getGameManager } from '$lib/server/game-manager';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * GET /api/game/[gameId]
 *
 * Returns the current game state snapshot, plus metadata.
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		error(401, 'Authentication required');
	}

	const gameId = params.gameId;
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

	const game = await prisma.game.findUnique({
		where: { id: gameId },
		include: {
			participants: {
				select: { userId: true, characterId: true }
			}
		}
	});

	if (!game) {
		error(404, `Game "${gameId}" not found`);
	}

	const state = await gameManager.getGameState(gameId);

	return json({
		id: game.id,
		status: game.status,
		participants: game.participants,
		state
	});
};
