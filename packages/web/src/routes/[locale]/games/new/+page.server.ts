import { getCharactersByOwner } from '$lib/database/characters';
import { translate, type Locale } from '@songsofdoom/common/localisation';
import { entities, isCampaign } from '@songsofdoom/game';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const locale = params.locale as Locale;

	if (!locals.user) {
		error(403, {
			type: 'auth_required',
			message: translate(
				{
					ca: "Has d'iniciar sessió per crear una partida",
					es: 'Debes iniciar sesión para crear una partida',
					en: 'You must log in to create a game'
				},
				locale
			)
		});
	}

	const characters = await getCharactersByOwner(locals.user.id);
	const campaignIds = entities
		.all()
		.filter(isCampaign)
		.map((c) => c.variantId);

	return {
		title: translate({ ca: 'Nova partida', es: 'Nueva partida', en: 'New game' }, locale),
		characters,
		campaignIds
	};
};
