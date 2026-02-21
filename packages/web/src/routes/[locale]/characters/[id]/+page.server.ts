import { getCharacterById } from '$lib/database/characters';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const characterId = parseInt(params.id, 10);
	const character = isNaN(characterId) ? undefined : await getCharacterById(characterId);
	if (!character) {
		error(404, { message: 'Character not found' });
	}
	return {
		title: character.name,
		heading: null,
		character
	};
};
