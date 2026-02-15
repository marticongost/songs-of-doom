import { dev } from '$app/environment';
import { prisma } from './db';
import type { Cookies } from '@sveltejs/kit';

const SESSION_COOKIE_NAME = 'session';
const SESSION_EXPIRY_DAYS = 30;

export interface SessionUser {
	id: string;
	username: string;
}

export interface Session {
	id: string;
	userId: string;
	expiresAt: Date;
}

function generateSessionId(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

export async function createSession(userId: string): Promise<Session> {
	const sessionId = generateSessionId();
	const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

	const session = await prisma.session.create({
		data: {
			id: sessionId,
			userId,
			expiresAt
		}
	});

	return session;
}

export async function validateSession(
	sessionId: string
): Promise<{ session: Session; user: SessionUser } | null> {
	const session = await prisma.session.findUnique({
		where: { id: sessionId },
		include: { user: true }
	});

	if (!session) {
		return null;
	}

	if (session.expiresAt < new Date()) {
		await prisma.session.delete({ where: { id: sessionId } });
		return null;
	}

	// Extend session if it expires within 15 days
	const shouldExtend = session.expiresAt.getTime() - Date.now() < 15 * 24 * 60 * 60 * 1000;

	if (shouldExtend) {
		const newExpiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
		await prisma.session.update({
			where: { id: sessionId },
			data: { expiresAt: newExpiresAt }
		});
		session.expiresAt = newExpiresAt;
	}

	return {
		session: {
			id: session.id,
			userId: session.userId,
			expiresAt: session.expiresAt
		},
		user: {
			id: session.user.id,
			username: session.user.username
		}
	};
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await prisma.session.delete({ where: { id: sessionId } }).catch(() => {
		// Session may already be deleted
	});
}

export function setSessionCookie(cookies: Cookies, sessionId: string, expiresAt: Date): void {
	cookies.set(SESSION_COOKIE_NAME, sessionId, {
		path: '/',
		httpOnly: true,
		secure: !dev,
		sameSite: 'lax',
		expires: expiresAt
	});
}

export function deleteSessionCookie(cookies: Cookies): void {
	cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}

export function getSessionIdFromCookie(cookies: Cookies): string | undefined {
	return cookies.get(SESSION_COOKIE_NAME);
}

export function generateUserId(): string {
	const bytes = new Uint8Array(15);
	crypto.getRandomValues(bytes);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}
