import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { verifyPassword } from '$lib/server/password';
import { createSession, setSessionCookie } from '$lib/server/auth';
import { translate, type Locale } from '$lib/localisation';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (locals.user) {
		redirect(302, `/${params.locale}`);
	}

	return {
		title: translate(
			{ ca: 'Iniciar sessió', es: 'Iniciar sesión', en: 'Log in' },
			params.locale as Locale
		)
	};
};

export const actions: Actions = {
	default: async ({ request, cookies, params }) => {
		const formData = await request.formData();
		const username = formData.get('username');
		const password = formData.get('password');
		const locale = params.locale as Locale;

		if (typeof username !== 'string' || username.length < 3 || username.length > 31) {
			return fail(400, {
				message: translate(
					{
						ca: "Nom d'usuari invàlid",
						es: 'Nombre de usuario inválido',
						en: 'Invalid username'
					},
					locale
				)
			});
		}

		if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
			return fail(400, {
				message: translate(
					{ ca: 'Contrasenya invàlida', es: 'Contraseña inválida', en: 'Invalid password' },
					locale
				)
			});
		}

		const user = await prisma.user.findUnique({
			where: { username: username.toLowerCase() }
		});

		if (!user) {
			return fail(400, {
				message: translate(
					{
						ca: 'Usuari o contrasenya incorrectes',
						es: 'Usuario o contraseña incorrectos',
						en: 'Incorrect username or password'
					},
					locale
				)
			});
		}

		const validPassword = await verifyPassword(user.password, password);

		if (!validPassword) {
			return fail(400, {
				message: translate(
					{
						ca: 'Usuari o contrasenya incorrectes',
						es: 'Usuario o contraseña incorrectos',
						en: 'Incorrect username or password'
					},
					locale
				)
			});
		}

		const session = await createSession(user.id);
		setSessionCookie(cookies, session.id, session.expiresAt);

		redirect(302, `/${params.locale}`);
	}
};
