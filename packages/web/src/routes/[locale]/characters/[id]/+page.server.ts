import { getCharacterById } from '$lib/database/characters';
import { canEditCharacter } from '$lib/permissions';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, depends }) => {
	const characterId = parseInt(params.id, 10);
	depends(`character:${characterId}`);
	const character = isNaN(characterId) ? undefined : await getCharacterById(characterId);
	if (!character) {
		error(404, { message: 'Character not found' });
	}
	return {
		title: character.name,
		heading: null,
		character,
		canEdit: canEditCharacter(character, locals.user)
	};
};
