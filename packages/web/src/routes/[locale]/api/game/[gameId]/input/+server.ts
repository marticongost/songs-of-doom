import { prisma } from '$lib/server/db';
import { ConflictError, NotFoundError } from '$lib/server/errors';
import { getGameManager } from '$lib/server/game-manager';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// ---------------------------------------------------------------------------
// POST /api/game/[gameId]/input
// ---------------------------------------------------------------------------

/**
 * Supplies player input to the engine and runs until the next
 * {@link InputStep} (or completion).
 *
 * This is the **only** client-initiated write operation during gameplay.
 * The body is a plain object whose keys correspond to the field names
 * returned by the most recent `input-required` SSE event.
 *
 * Returns `204 No Content` on success — state updates and subsequent
 * `input-required` events are delivered via SSE to all connected clients.
 */
export const POST: RequestHandler = async ({ params, locals, request }) => {
	// --- Authentication ---
	if (!locals.user) {
		error(401, 'Authentication required');
	}

	const gameId = params.gameId;

	// --- Parse body ---
	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}

	if (typeof body !== 'object' || body === null || Array.isArray(body)) {
		error(400, 'Body must be a JSON object');
	}

	// --- Look up game & verify participation ---
	const game = await prisma.game.findUnique({
		where: { id: gameId },
		include: {
			participants: {
				select: { userId: true }
			}
		}
	});

	if (!game) {
		error(404, `Game "${gameId}" not found`);
	}

	const participantIndex = game.participants.findIndex((p) => p.userId === locals.user!.id);
	if (participantIndex === -1) {
		error(403, 'You are not a participant in this game');
	}

	// Player IDs are assigned in participant order: plr1, plr2, ...
	const userPlayerId: `plr${number}` = `plr${participantIndex + 1}`;

	// --- Verify engine is awaiting input ---
	const gameManager = getGameManager();
	const inputState = gameManager.getInputState(gameId);

	if (!inputState) {
		error(409, 'The engine is not currently awaiting input');
	}

	// --- Verify it is the requesting player's turn ---
	if (inputState.awaitingPlayerId !== userPlayerId) {
		error(409, `It is not your turn. Waiting for ${inputState.awaitingPlayerId}`);
	}

	// --- Supply input & run ---
	// State updates and the next input-required event are broadcast via SSE;
	// the REST response just acknowledges receipt.
	try {
		await gameManager.supplyInput(gameId, body);
		return new Response(null, { status: 204 });
	} catch (err) {
		if (err instanceof NotFoundError) {
			error(404, err.message);
		}
		if (err instanceof ConflictError) {
			error(409, err.message);
		}
		// Re-throw unexpected errors so SvelteKit returns 500.
		throw err;
	}
};
