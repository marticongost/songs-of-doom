import { ForbiddenError, NotFoundError } from '$lib/server/errors';
import { getGameManager, type GameMeta, type SSESubscriber } from '$lib/server/game-manager';
import { engineSerialisation, type JournalEntry } from '@songsofdoom/engine';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// ---------------------------------------------------------------------------
// GET /api/game/[gameId]/events
// ---------------------------------------------------------------------------

/**
 * Returns an SSE stream of live journal updates and input-required
 * notifications.  Not intended for historical data — use `GET /log` for
 * the full game log.
 *
 * Query params:
 * - `since` (number, optional): Pre-flush entries with index > `since`
 *   before streaming live.  Should be provided on initial connection to
 *   avoid re-sending the entire journal.
 *
 * Headers:
 * - `Game-Client-Version`: Client git SHA for version negotiation.
 *
 * Events:
 * - `state`: New journal entries appended since the last known index.
 * - `input-required`: Engine is awaiting player input.
 *
 * Version mismatches are handled by the global {@link versionCheckHandle}
 * hook, which returns 409 before this handler runs — consistent with all
 * other `/api/**` routes.
 */
export const GET: RequestHandler = async ({ params, locals, url }) => {
	// --- Authentication ---
	if (!locals.user) {
		error(401, 'Authentication required');
	}

	const gameId = params.gameId;
	const gameManager = getGameManager();

	// --- Verify participation ---
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

	// --- Parse `since` ---
	const sinceParam = url?.searchParams.get('since') ?? null;
	const since = parseSince(sinceParam);

	// --- Pre-load engine (may not exist for PREPARATION games) ---
	const engine = await gameManager.getEngine(gameId);

	const context = gameManager.serialisationContext;

	// --- SSE stream ---
	let subscriber: SSESubscriber | null = null;
	let closed = false;

	/** Serialise a payload for the SSE data field. */
	function wireEncode(payload: unknown): string {
		return engineSerialisation.serialise(payload, context);
	}

	const stream = new ReadableStream({
		start(controller) {
			subscriber = {
				sendState(newEntries: JournalEntry[]) {
					if (closed) return;
					try {
						controller.enqueue(`event: state\ndata: ${wireEncode({ newEntries })}\n\n`);
					} catch {
						/* stream may have been cancelled */
					}
				},

				sendInputRequired(awaitingPlayerId: string, fields: unknown[]) {
					if (closed) return;
					try {
						controller.enqueue(
							`event: input-required\ndata: ${wireEncode({ awaitingPlayerId, fields })}\n\n`
						);
					} catch {
						/* stream may have been cancelled */
					}
				},

				sendMeta(meta: GameMeta) {
					if (closed) return;
					try {
						controller.enqueue(`event: meta\ndata: ${wireEncode(meta)}\n\n`);
					} catch {
						/* stream may have been cancelled */
					}
				},

				close(_reason?: string) {
					if (closed) return;
					closed = true;
					try {
						controller.close();
					} catch {
						/* may already be closed */
					}
				}
			};

			// --- Catch-up: pre-flush entries after `since` (only if engine exists) ---
			if (engine && since !== null && engine.journal.length > since + 1) {
				const catchUpEntries = engine.journal.slice(since + 1) as JournalEntry[];
				subscriber.sendState(catchUpEntries);
			}

			// If the engine is currently awaiting input, notify immediately.
			if (engine) {
				const inputState = gameManager.getInputState(gameId);
				if (inputState) {
					subscriber.sendInputRequired(inputState.awaitingPlayerId, inputState.fields);
				}
			}

			// --- Subscribe for live updates ---
			gameManager.subscribe(gameId, subscriber);

			// --- Send initial meta so clients transition out of 'connecting' ---
			// Always send a meta event on initial connection so the client
			// transitions from 'connecting' to 'lobby' or gameplay, even when
			// no state/input-required events are immediately pending.
			gameManager.sendMetaToSubscriber(gameId, subscriber);
		},

		cancel() {
			closed = true;
			if (subscriber) {
				gameManager.unsubscribe(gameId, subscriber);
			}
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Safely parses the `?since=` query parameter.
 *
 * Returns a non-negative integer index, or `null` when the parameter is
 * missing or invalid (so the stream starts live with no catch-up).
 *
 * A value of `-1` is allowed as a sentinel meaning "I have no entries yet,
 * send everything from the start."
 */
function parseSince(raw: string | null): number | null {
	if (raw === null) return null;

	const n = Number(raw);
	if (!Number.isFinite(n) || !Number.isInteger(n)) return null;

	// -1 means "from the beginning" (entry indices are 0-based)
	if (n < -1) return null;

	return n;
}
