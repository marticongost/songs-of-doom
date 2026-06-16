import { prisma } from '$lib/server/db';
import { getGameManager } from '$lib/server/game-manager';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * GET /api/game/[gameId]
 *
 * Returns the current game state snapshot, plus metadata.
 */
export const GET: RequestHandler = async ({ params }) => {
	const gameId = params.gameId;

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

	const gameManager = getGameManager();
	const state = await gameManager.getGameState(gameId);

	return json({
		id: game.id,
		status: game.status,
		participants: game.participants,
		state
	});
};
