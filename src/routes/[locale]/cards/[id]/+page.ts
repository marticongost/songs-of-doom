import { entities } from '$lib/catalog/entities';
import { error } from '@sveltejs/kit';
import { translate, type Locale } from '$lib/localisation';
import CardDetailHeading from './CardDetailHeading.svelte';

export const load = ({ params }: { params: { id: string; locale: Locale } }) => {
	const entity = entities.get(params.id);
	if (!entity) {
		error(404, `Card '${params.id}' not found`);
	}
	return {
		title: translate(entity.title, params.locale),
		heading: CardDetailHeading,
		entity
	};
};
