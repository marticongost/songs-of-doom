import { entities } from '@songsofdoom/game';
import type { Entity } from '@songsofdoom/game';
import { Module } from '@songsofdoom/game';
import { translate, type Locale } from '@songsofdoom/common/localisation';

interface CardsPageData {
	title: string;
	entities: Array<Entity>;
	locale: Locale;
}

export const load = ({ params }: { params: { locale: Locale } }): CardsPageData => {
	return {
		title: translate({ ca: 'Cartes', es: 'Cartas', en: 'Cards' }, params.locale),
		entities: entities.all().filter((entity) => !(entity instanceof Module)),
		locale: params.locale
	};
};
