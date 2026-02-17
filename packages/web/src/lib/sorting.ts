import {
	requireLocalisedField,
	type Locale,
	type LocalisedText
} from '@songsofdoom/common/localisation';
import type { Entity, EntityTypeId } from '@songsofdoom/game';

export type SortCriteriaType =
	| 'alpha'
	| 'type'
	| 'set'
	| 'xp-asc'
	| 'xp-desc'
	| 'gold-asc'
	| 'gold-desc';

export abstract class SortCriteria {
	readonly type: SortCriteriaType;
	readonly label: LocalisedText;

	constructor(type: SortCriteriaType, label: LocalisedText) {
		this.type = type;
		this.label = label;
	}

	abstract sort(entities: Array<Entity>, locale: Locale): Array<Entity>;

	static resolve(criteria: SortCriteriaType | SortCriteria): SortCriteria {
		if (criteria instanceof SortCriteria) {
			return criteria;
		}
		const resolved = sortCriteria[criteria];
		if (!resolved) {
			throw new Error(`Unknown sort criteria: ${criteria}`);
		}
		return resolved;
	}
}

export interface Group {
	id: string;
	title: LocalisedText;
}

export interface GroupingResult {
	group: Group;
	entities: Array<Entity>;
}

export abstract class GroupingCriteria extends SortCriteria {
	abstract group(entities: Array<Entity>, locale: Locale): Array<GroupingResult>;
}

function compareByTitle(
	a: { title: LocalisedText },
	b: { title: LocalisedText },
	locale: Locale
): number {
	const aTitle = requireLocalisedField(a, 'title', locale);
	const bTitle = requireLocalisedField(b, 'title', locale);
	return aTitle.localeCompare(bTitle, locale);
}

const UNCATEGORIZED_ID = '__uncategorized__';
const uncategorizedTitle: LocalisedText = {
	ca: 'Sense categoria',
	es: 'Sin categoría',
	en: 'Uncategorized'
};

class SetSort extends GroupingCriteria {
	group(entities: Array<Entity>, locale: Locale): Array<GroupingResult> {
		const groups = new Map<string, { group: Group; entities: Entity[] }>();

		for (const entity of entities) {
			const set = entity.set;
			const id = set?.id ?? UNCATEGORIZED_ID;
			const title = set?.title ?? uncategorizedTitle;

			if (!groups.has(id)) {
				groups.set(id, { group: { id, title }, entities: [] });
			}
			groups.get(id)!.entities.push(entity);
		}

		// Sort groups alphabetically, but keep Uncategorized at the end
		const uncategorized = groups.get(UNCATEGORIZED_ID);
		groups.delete(UNCATEGORIZED_ID);

		const sortedGroups = [...groups.values()]
			.sort((a, b) => compareByTitle(a.group, b.group, locale))
			.map(({ group, entities }) => ({
				group,
				entities: this.sort(entities, locale)
			}));

		if (uncategorized) {
			sortedGroups.push({
				group: uncategorized.group,
				entities: this.sort(uncategorized.entities, locale)
			});
		}

		return sortedGroups;
	}

	sort(entities: Array<Entity>, locale: Locale): Array<Entity> {
		return [...entities].sort((a, b) => {
			return compareByTitle(a, b, locale);
		});
	}
}

class EntityTypeSort extends GroupingCriteria {
	group(entities: Array<Entity>, locale: Locale): Array<GroupingResult> {
		const groups = new Map<EntityTypeId, { group: Group; entities: Entity[] }>();

		for (const entity of entities) {
			const type = entity.type;
			if (!groups.has(type.id)) {
				groups.set(type.id, {
					group: { id: type.id, title: type.pluralTitle },
					entities: []
				});
			}
			groups.get(type.id)!.entities.push(entity);
		}

		return [...groups.values()]
			.sort((a, b) => compareByTitle(a.group, b.group, locale))
			.map(({ group, entities }) => ({
				group,
				entities: this.sort(entities, locale)
			}));
	}

	sort(entities: Array<Entity>, locale: Locale): Array<Entity> {
		return [...entities].sort((a, b) => compareByTitle(a, b, locale));
	}
}

class AlphabeticalSort extends SortCriteria {
	sort(entities: Array<Entity>, locale: Locale): Array<Entity> {
		return [...entities].sort((a, b) => compareByTitle(a, b, locale));
	}
}

class NumericCostSort extends SortCriteria {
	constructor(
		type: SortCriteriaType,
		label: LocalisedText,
		private readonly field: 'xpCost' | 'goldCost',
		private readonly direction: 'asc' | 'desc'
	) {
		super(type, label);
	}

	sort(entities: Array<Entity>, locale: Locale): Array<Entity> {
		return entities
			.filter((e) => e[this.field] !== undefined)
			.sort((a, b) => {
				const diff = a[this.field]! - b[this.field]!;
				const directed = this.direction === 'asc' ? diff : -diff;
				return directed || compareByTitle(a, b, locale);
			});
	}
}

export const alpha = new AlphabeticalSort('alpha', {
	ca: 'Alfabètic',
	es: 'Alfabético',
	en: 'Alphabetical'
});
export const type = new EntityTypeSort('type', { ca: 'Tipus', es: 'Tipo', en: 'Type' });
export const set = new SetSort('set', { ca: 'Conjunt', es: 'Conjunto', en: 'Set' });
export const xpAsc = new NumericCostSort(
	'xp-asc',
	{ ca: 'Experiència (ascendent)', es: 'Experiencia (ascendente)', en: 'Experience (ascending)' },
	'xpCost',
	'asc'
);
export const xpDesc = new NumericCostSort(
	'xp-desc',
	{
		ca: 'Experiència (descendent)',
		es: 'Experiencia (descendente)',
		en: 'Experience (descending)'
	},
	'xpCost',
	'desc'
);
export const goldAsc = new NumericCostSort(
	'gold-asc',
	{ ca: 'Or (ascendent)', es: 'Oro (ascendente)', en: 'Gold (ascending)' },
	'goldCost',
	'asc'
);
export const goldDesc = new NumericCostSort(
	'gold-desc',
	{
		ca: 'Or (descendent)',
		es: 'Oro (descendente)',
		en: 'Gold (descending)'
	},
	'goldCost',
	'desc'
);

export const sortCriteria: Record<SortCriteriaType, SortCriteria> = {
	alpha,
	type,
	set,
	'xp-asc': xpAsc,
	'xp-desc': xpDesc,
	'gold-asc': goldAsc,
	'gold-desc': goldDesc
};
