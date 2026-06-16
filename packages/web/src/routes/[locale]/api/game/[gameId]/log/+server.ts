import { getGameManager } from '$lib/server/game-manager';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * GET /api/game/[gameId]/log
 *
 * Returns the journal log without the full game state for each entry.
 * Only includes enough information to render the log (procedureId, step, status, parentIndex).
 *
 * Query params:
 * - `since` (number, optional): Only return entries with index > `since`.
 *   Used for incremental fetch on reconnection.
 */
export const GET: RequestHandler = async ({ params, url }) => {
	const gameId = params.gameId;
	const since = url?.searchParams.get('since') ?? null;

	const gameManager = getGameManager();
	const log = await gameManager.getGameLog(gameId, since !== null ? Number(since) : undefined);
	return json({ log });
};
