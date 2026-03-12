import { translate, type Locale } from '@songsofdoom/common/localisation';
import type { Entity, EntityTypeId } from '@songsofdoom/game';
import { entities } from '@songsofdoom/game';

interface CardsPageData {
	title: string;
	entities: Array<Entity>;
	locale: Locale;
}

const excludedCardTypes: Set<EntityTypeId> = new Set(['module', 'discipline', 'campaign']);

export const load = ({ params }: { params: { locale: Locale } }): CardsPageData => {
	return {
		title: translate({ ca: 'Cartes', es: 'Cartas', en: 'Cards' }, params.locale),
		entities: entities.all().filter((entity) => !excludedCardTypes.has(entity.type.id)),
		locale: params.locale
	};
};
