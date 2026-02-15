import type { Handle } from '@sveltejs/kit';
import {
	getSessionIdFromCookie,
	validateSession,
	setSessionCookie,
	deleteSessionCookie
} from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
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
