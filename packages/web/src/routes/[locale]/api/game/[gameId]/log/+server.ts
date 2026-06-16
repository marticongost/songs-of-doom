import { getGameManager } from '$lib/server/game-manager';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * GET /api/game/[gameId]/log
 *
 * Returns the full journal log without the full game state for each entry.
 * Only includes enough information to render the log (procedureId, step, status, parentIndex).
 */
export const GET: RequestHandler = async ({ params }) => {
	const gameId = params.gameId;

	const gameManager = getGameManager();
	const log = await gameManager.getGameLog(gameId);
	return json({ log });
};
