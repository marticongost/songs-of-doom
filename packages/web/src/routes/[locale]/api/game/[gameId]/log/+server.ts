import { ForbiddenError, NotFoundError } from '$lib/server/errors';
import { getGameManager } from '$lib/server/game-manager';
import { error, json } from '@sveltejs/kit';
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
export const GET: RequestHandler = async ({ params, locals, url }) => {
	if (!locals.user) {
		error(401, 'Authentication required');
	}

	const gameId = params.gameId;
	const since = url?.searchParams.get('since') ?? null;

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

	const log = await gameManager.getGameLog(gameId, since !== null ? Number(since) : undefined);
	return json({ log });
};
