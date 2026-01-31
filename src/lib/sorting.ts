import type { Entity } from '$lib/catalog/models/entity';
import { requireLocalisedField, type Locale, type LocalisedText } from '$lib/localisation';

export type SortCriteriaType = 'alpha' | 'xp-asc' | 'xp-desc' | 'gold-asc' | 'gold-desc';

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

class AlphabeticalSort extends SortCriteria {
	sort(entities: Array<Entity>, locale: Locale): Array<Entity> {
		return [...entities].sort((a, b) => {
			const aTitle = requireLocalisedField(a, 'title', locale);
			const bTitle = requireLocalisedField(b, 'title', locale);
			return aTitle.localeCompare(bTitle, locale);
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
				if (directed !== 0) return directed;
				const aTitle = requireLocalisedField(a, 'title', locale);
				const bTitle = requireLocalisedField(b, 'title', locale);
				return aTitle.localeCompare(bTitle, locale);
			});
	}
}

export const sortCriteria: Record<SortCriteriaType, SortCriteria> = {
	alpha: new AlphabeticalSort({ ca: 'Alfabètic', es: 'Alfabético', en: 'Alphabetical' }),
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
