import { createCharacterRevision, getCharacterById } from '$lib/database/characters';
import { canEditCharacter } from '$lib/permissions';
import { translate, type Locale } from '@songsofdoom/common/localisation';
import { CharacterState } from '@songsofdoom/game';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const characterId = parseInt(params.id, 10);
	const character = isNaN(characterId) ? undefined : await getCharacterById(characterId);
	if (!character) {
		error(404, { message: 'Character not found' });
	}
	if (!canEditCharacter(character, locals.user)) {
		redirect(303, `/${params.locale}/characters/${params.id}`);
	}
	return {
		title: character.name,
		heading: null,
		character
	};
};

export const actions: Actions = {
	save: async ({ request, params, locals }) => {
		const locale = params.locale as Locale;
		const characterId = parseInt(params.id, 10);

		// Require authentication
		if (!locals.user) {
			return fail(401, {
				message: translate(
					{
						ca: "Has d'iniciar sessió per desar canvis",
						es: 'Debes iniciar sesión para guardar cambios',
						en: 'You must log in to save changes'
					},
					locale
				)
			});
		}

		// Load character and verify ownership
		const character = isNaN(characterId) ? undefined : await getCharacterById(characterId);
		if (!character) {
			return fail(404, {
				message: translate(
					{
						ca: 'Personatge no trobat',
						es: 'Personaje no encontrado',
						en: 'Character not found'
					},
					locale
				)
			});
		}

		if (!canEditCharacter(character, locals.user)) {
			return fail(403, {
				message: translate(
					{
						ca: 'No tens permís per editar aquest personatge',
						es: 'No tienes permiso para editar este personaje',
						en: 'You do not have permission to edit this character'
					},
					locale
				)
			});
		}

		// Parse the form data
		const formData = await request.formData();
		const stateJson = formData.get('state');

		if (typeof stateJson !== 'string') {
			return fail(400, {
				message: translate(
					{
						ca: 'Dades invàlides',
						es: 'Datos inválidos',
						en: 'Invalid data'
					},
					locale
				)
			});
		}

		try {
			const stateData = JSON.parse(stateJson);
			const state = new CharacterState(stateData);

			await createCharacterRevision(characterId, state);

			return {
				success: true,
				message: translate(
					{
						ca: 'Canvis desats!',
						es: '¡Cambios guardados!',
						en: 'Changes saved!'
					},
					locale
				)
			};
		} catch {
			return fail(500, {
				message: translate(
					{
						ca: 'Error en desar el personatge',
						es: 'Error al guardar el personaje',
						en: 'Error saving character'
					},
					locale
				)
			});
		}
	}
};
