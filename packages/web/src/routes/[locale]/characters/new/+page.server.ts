import { error, fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { translate, type Locale } from '@songsofdoom/common/localisation';
import { CharacterState } from '@songsofdoom/game';
import { characterStateToJson } from '$lib/database/characters';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const locale = params.locale as Locale;

	if (!locals.user) {
		error(403, {
			type: 'auth_required',
			message: translate(
				{
					ca: "Has d'iniciar sessió per crear un personatge",
					es: 'Debes iniciar sesión para crear un personaje',
					en: 'You must log in to create a character'
				},
				locale
			)
		});
	}

	return {
		title: translate({ ca: 'Nou personatge', es: 'Nuevo personaje', en: 'New character' }, locale)
	};
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		const locale = params.locale as Locale;

		if (!locals.user) {
			error(403, {
				type: 'auth_required',
				message: translate(
					{
						ca: "Has d'iniciar sessió per crear un personatge",
						es: 'Debes iniciar sesión para crear un personaje',
						en: 'You must log in to create a character'
					},
					locale
				)
			});
		}

		const formData = await request.formData();
		const name = formData.get('name');

		if (typeof name !== 'string' || name.trim().length < 2) {
			return fail(400, {
				message: translate(
					{
						ca: 'El nom ha de tenir almenys 2 caràcters',
						es: 'El nombre debe tener al menos 2 caracteres',
						en: 'Name must be at least 2 characters'
					},
					locale
				)
			});
		}

		const initialState = characterStateToJson(CharacterState.initial()) as object;
		const character = await prisma.character.create({
			data: {
				name: name.trim(),
				ownerId: locals.user.id,
				revisions: {
					create: {
						number: 1,
						state: initialState,
						totalXp: 0,
						finalised: false
					}
				}
			}
		});

		redirect(302, `/${locale}/characters/${character.id}`);
	}
};
