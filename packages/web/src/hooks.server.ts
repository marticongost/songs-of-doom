import {
	deleteSessionCookie,
	getSessionIdFromCookie,
	setSessionCookie,
	validateSession
} from '$lib/server/auth';
import { checkVersion } from '$lib/server/version-check';
import { cache } from '@emotion/css';
import createEmotionServer from '@emotion/server/create-instance';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const { extractCritical } = createEmotionServer(cache);

/**
 * SvelteKit server hook that enforces client–server version alignment for
 * every request under `/[locale]/api/`.
 *
 * The client (typically {@link GameStore}) sends the header
 * `Game-Client-Version` whose value is the git SHA embedded at build time.
 * The server compares it against `GAME_VERSION` (injected via
 * `vite.define`).  A mismatch means the client is stale — its
 * serialisation format may be incompatible — so the request is rejected.
 *
 * **Behaviour by path:**
 * - **`/api/**`** – version header is checked.  On mismatch a
 *   `409 Conflict` response with `{ requiredVersion }` is returned
 *   immediately (the route handler is never reached).
 * - **All other paths** – pass through unchanged.
 *
 * @returns `Response` (409 JSON) on version mismatch, otherwise the result
 * of the next hook / route handler via `resolve(event)`.
 */
export const versionCheckHandle: Handle = async ({ event, resolve }) => {
	if (/\/api(?:\/|$)/.test(event.url.pathname)) {
		const result = checkVersion(event.request);
		if (result.type === 'mismatch') {
			return result.response;
		}
	}
	return resolve(event);
};

const authHandle: Handle = async ({ event, resolve }) => {
	const sessionId = getSessionIdFromCookie(event.cookies);

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const result = await validateSession(sessionId);

	if (result) {
		event.locals.user = result.user;
		event.locals.session = result.session;
		// Update cookie if session was extended
		setSessionCookie(event.cookies, result.session.id, result.session.expiresAt);
	} else {
		event.locals.user = null;
		event.locals.session = null;
		deleteSessionCookie(event.cookies);
	}

	return resolve(event);
};

const emotionHandle: Handle = ({ event, resolve }) =>
	resolve(event, {
		transformPageChunk: ({ html, done }) => {
			if (!done) return html;
			const { css, ids } = extractCritical(html);
			if (!css) return html;
			return html.replace(
				'</head>',
				`<style data-emotion="${cache.key} ${ids.join(' ')}">${css}</style></head>`
			);
		}
	});

export const handle = sequence(versionCheckHandle, authHandle, emotionHandle);
