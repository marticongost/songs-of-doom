import type { Entity } from '$lib/catalog/models/entity';
import { requireLocalisedField, type Locale, type LocalisedText } from '$lib/localisation';

export type SortCriteriaType =
	| 'alpha'
	| 'type'
	| 'set'
	| 'xp-asc'
	| 'xp-desc'
	| 'gold-asc'
	| 'gold-desc';

export abstract class SortCriteria {
	readonly label: LocalisedText;

	constructor(label: LocalisedText) {
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

function compareByTitle(
	a: { title: LocalisedText },
	b: { title: LocalisedText },
	locale: Locale
): number {
	const aTitle = requireLocalisedField(a, 'title', locale);
	const bTitle = requireLocalisedField(b, 'title', locale);
	return aTitle.localeCompare(bTitle, locale);
}

class EntityTypeSort extends SortCriteria {
	sort(entities: Array<Entity>, locale: Locale): Array<Entity> {
		return entities.sort((a, b) => {
			return compareByTitle(a.type, b.type, locale) || compareByTitle(a, b, locale);
		});
	}
}

class AlphabeticalSort extends SortCriteria {
	sort(entities: Array<Entity>, locale: Locale): Array<Entity> {
		return [...entities].sort((a, b) => compareByTitle(a, b, locale));
	}
}

class SetSort extends SortCriteria {
	sort(entities: Array<Entity>, locale: Locale): Array<Entity> {
		return [...entities].sort((a, b) => {
			const aSet = a.set;
			const bSet = b.set;

			// Entities without a set go to the end
			if (!aSet && !bSet) return compareByTitle(a, b, locale);
			if (!aSet) return 1;
			if (!bSet) return -1;

			// Sort by set title, then by entity title as tiebreaker
			return compareByTitle(aSet, bSet, locale) || compareByTitle(a, b, locale);
		});
	}
}

class NumericCostSort extends SortCriteria {
	constructor(
		label: LocalisedText,
		private readonly field: 'xpCost' | 'goldCost',
		private readonly direction: 'asc' | 'desc'
	) {
		super(label);
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

export const sortCriteria: Record<SortCriteriaType, SortCriteria> = {
	alpha: new AlphabeticalSort({ ca: 'Alfabètic', es: 'Alfabético', en: 'Alphabetical' }),
	type: new EntityTypeSort({ ca: 'Tipus', es: 'Tipo', en: 'Type' }),
	set: new SetSort({ ca: 'Conjunt', es: 'Conjunto', en: 'Set' }),
	'xp-asc': new NumericCostSort(
		{ ca: 'Experiència (ascendent)', es: 'Experiencia (ascendente)', en: 'Experience (ascending)' },
		'xpCost',
		'asc'
	),
	'xp-desc': new NumericCostSort(
		{
			ca: 'Experiència (descendent)',
			es: 'Experiencia (descendente)',
			en: 'Experience (descending)'
		},
		'xpCost',
		'desc'
	),
	'gold-asc': new NumericCostSort(
		{ ca: 'Or (ascendent)', es: 'Oro (ascendente)', en: 'Gold (ascending)' },
		'goldCost',
		'asc'
	),
	'gold-desc': new NumericCostSort(
		{ ca: 'Or (descendent)', es: 'Oro (descendente)', en: 'Gold (descending)' },
		'goldCost',
		'desc'
	)
};

export const sortOptions: Array<{ value: SortCriteriaType; label: LocalisedText }> = Object.entries(
	sortCriteria
).map(([value, criteria]) => ({ value: value as SortCriteriaType, label: criteria.label }));

export function sortedEntities(
	entities: Array<Entity>,
	criteria: SortCriteriaType | SortCriteria,
	locale: Locale
): Array<Entity> {
	return SortCriteria.resolve(criteria).sort(entities, locale);
}
