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
				select: {
					userId: true,
					characterId: true,
					character: {
						select: {
							revisions: {
								orderBy: { number: 'desc' },
								take: 1,
								select: { state: true }
							}
						}
					}
				}
			}
		}
	});

	if (!game) {
		error(404, `Game "${gameId}" not found`);
	}

	const state = await gameManager.getGameState(gameId);
	const lastAcknowledgedJournalIndex = await gameManager.getAcknowledgedIndex(
		gameId,
		locals.user.id
	);

	const extractName = (state: unknown): string =>
		(typeof state === 'object' && state !== null && 'name' in state
			? (state as Record<string, unknown>).name
			: 'Unnamed') as string;

	return json({
		id: game.id,
		status: game.status,
		campaignId: game.campaignId,
		ownerId: game.ownerId,
		participants: game.participants.map((p) => ({
			userId: p.userId,
			characterId: p.characterId,
			characterName: extractName(p.character.revisions[0]?.state)
		})),
		lastAcknowledgedJournalIndex,
		state
	});
};
