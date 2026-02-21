import type { Session, SessionUser } from '$lib/server/auth';
import type { Component } from 'svelte';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			type?: 'auth_required';
			message: string;
		}
		interface Locals {
			user: SessionUser | null;
			session: Session | null;
		}
		interface PageData {
			heading?: Component | null;
			user?: SessionUser | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
