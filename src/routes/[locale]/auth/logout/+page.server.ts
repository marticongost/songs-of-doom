import { redirect } from '@sveltejs/kit';
import { invalidateSession, deleteSessionCookie } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	redirect(302, `/${params.locale}`);
};

export const actions: Actions = {
	default: async ({ locals, cookies, params }) => {
		if (locals.session) {
			await invalidateSession(locals.session.id);
		}

		deleteSessionCookie(cookies);
		redirect(302, `/${params.locale}`);
	}
};
