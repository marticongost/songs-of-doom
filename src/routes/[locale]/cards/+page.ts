import { entities } from '$lib/catalog/entities';
import type { Entity } from '$lib/catalog/models/entity';
import { translate, type Locale } from '$lib/localisation';

interface CardsPageData {
	title: string;
	entities: Array<Entity>;
}

export const load = ({ params }: { params: { locale: Locale } }): CardsPageData => {
	return {
		title: translate({ ca: 'Cartes', es: 'Cartas', en: 'Cards' }, params.locale),
		entities: entities.all()
	};
};
