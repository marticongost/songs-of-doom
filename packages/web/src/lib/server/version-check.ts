/**
 * Server-side version-check helpers.
 *
 * The server embeds its git SHA at build time as the global `GAME_VERSION`
 * constant (injected via vite.define).  Every game API request must include
 * the header `Game-Client-Version` with the client's built-in git SHA.
 *
 * On mismatch the server rejects the request so the client knows to reload
 * — this is the safety net that prevents a stale client from sending
 * commands to a server whose serialisation format has changed.
 */

/**
 * Result returned by {@link checkVersion} — either proceed or reject.
 *
 * The caller should **not** continue processing the request when
 * `type` is `"mismatch"`; instead it should return the `response` directly.
 */
export type VersionCheckResult = { type: 'match' } | { type: 'mismatch'; response: Response };

/**
 * Compare the `Game-Client-Version` request header against the build-time
 * server version.
 *
 * API endpoints are only called by the client-side JS (GameStore), which
 * always sends this header.  A missing header is an invalid request.
 *
 * @returns `{ type: 'match' }` to proceed, or `{ type: 'mismatch', response }`
 *          with a `409 Conflict` JSON body that the caller must return.
 */
export function checkVersion(request: Request): VersionCheckResult {
	const clientVersion = request.headers.get('Game-Client-Version');

	// Version missing or out of date — reject the request with a 409 Conflict response.
	if (clientVersion !== GAME_VERSION) {
		return {
			type: 'mismatch',
			response: Response.json({ requiredVersion: GAME_VERSION }, { status: 409 })
		};
	}

	return { type: 'match' };
}
