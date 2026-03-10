import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { cache } from '@emotion/css';
import createEmotionServer from '@emotion/server/create-instance';
import {
	getSessionIdFromCookie,
	validateSession,
	setSessionCookie,
	deleteSessionCookie
} from '$lib/server/auth';

const { extractCritical } = createEmotionServer(cache);

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

export const handle = sequence(authHandle, emotionHandle);
