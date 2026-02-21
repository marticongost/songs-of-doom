import { getCharacters } from '$lib/database/characters';
import { translate, type Locale } from '@songsofdoom/common/localisation';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const locale = params.locale as Locale;
	const characters = await getCharacters();
	return {
		title: translate({ ca: 'Personatges', es: 'Personajes', en: 'Characters' }, locale),
		characters
	};
};
