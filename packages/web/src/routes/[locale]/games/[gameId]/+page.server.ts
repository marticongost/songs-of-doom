import { getCharactersByOwner } from '$lib/database/characters';
import type { PageServerLoad } from './$types';

/**
 * Loads the current user's characters for the join-game dropdown.
 * The game state itself is loaded client-side via GameStore + SSE.
 */
export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return { characters: [] };
	}

	const characters = await getCharactersByOwner(locals.user.id);
	const characterOptions = characters.map((c) => ({
		id: c.id,
		name: c.name
	}));

	return { characters: characterOptions };
};
