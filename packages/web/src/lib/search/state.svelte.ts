import { goto } from '$app/navigation';
import { page } from '$app/state';
import type { LocalisedText } from '@songsofdoom/common/localisation';
import { entityTypes, type Entity, type EntityType, type EntityTypeId } from '@songsofdoom/game';

import { getLocale } from '$lib/context/locale';
import {
	GroupingCriteria,
	SortCriteria,
	sortCriteria,
	type GroupingResult,
	type SortCriteriaType
} from '../sorting';
import { filterByTitle } from './search';

/** Accepts either the ID string or the full object */
export type EntityTypeInput = EntityTypeId | EntityType;
export type SortCriteriaInput = SortCriteriaType | SortCriteria;

export interface EntitySearchStateOptions {
	/** Restrict which entity types can be filtered (defaults to all) */
	allowedTypes?: EntityTypeInput[];
	/** Restrict which sort options are available (defaults to all) */
	allowedSorts?: SortCriteriaInput[];
	/** Default sort criteria (defaults to 'alpha') */
	defaultSort?: SortCriteriaInput;
	/** Sync state with URL params (defaults to true) */
	syncUrl?: boolean;
}

export type SortedResult =
	| { entities: Entity[]; groupedEntities?: never }
	| { groupedEntities: GroupingResult[]; entities?: never };

/** Normalizes EntityTypeInput to EntityType */
function normalizeEntityType(input: EntityTypeInput): EntityType {
	if (typeof input === 'string') {
		const type = entityTypes[input];
		if (!type) throw new Error(`Unknown entity type: ${input}`);
		return type;
	}
	return input;
}

/** Normalizes SortCriteriaInput to SortCriteria */
function normalizeSortCriteria(input: SortCriteriaInput): SortCriteria {
	if (typeof input === 'string') {
		return SortCriteria.resolve(input);
	}
	return input;
}

/**
 * Encapsulates search, filter, and sort state for entity listings.
 * Manages URL synchronization and provides event handlers for UI bindings.
 */
export class EntitySearchState {
	// URL parameter names
	private readonly sortParam = 'sort';
	private readonly searchParam = 'q';
	private readonly typeParam = 'type';

	// Configuration
	readonly allowedTypes: EntityType[] | undefined;
	readonly allowedSorts: SortCriteria[];
	readonly defaultSort: SortCriteria;
	private readonly syncUrl: boolean;

	// Reactive state
	private _search = $state('');
	private _type = $state<EntityType | null>(null);
	private _sort = $state<SortCriteria>(sortCriteria.alpha);

	// Dropdown options (computed once from configuration)
	readonly typeOptions: Array<{ value: EntityTypeId | ''; label: LocalisedText }>;
	readonly sortOptions: Array<{ value: SortCriteriaType; label: LocalisedText }>;

	constructor(options?: EntitySearchStateOptions) {
		// Normalize configuration
		this.allowedTypes = options?.allowedTypes?.map(normalizeEntityType);
		this.allowedSorts =
			options?.allowedSorts?.map(normalizeSortCriteria) ?? Object.values(sortCriteria);
		this.defaultSort = options?.defaultSort
			? normalizeSortCriteria(options.defaultSort)
			: sortCriteria.alpha;
		this.syncUrl = options?.syncUrl ?? true;

		// Initialize sort to default
		this._sort = this.defaultSort;

		// Build type filter options
		const types = this.allowedTypes ?? Object.values(entityTypes);
		this.typeOptions = [
			{ value: '', label: { ca: 'Tots els tipus', es: 'Todos los tipos', en: 'All types' } },
			...types.map((type) => ({ value: type.id, label: type.pluralTitle }))
		];

		// Build sort options
		this.sortOptions = this.allowedSorts.map((criteria) => ({
			value: criteria.type,
			label: criteria.label
		}));

		// Initialize from URL if syncing
		if (this.syncUrl) {
			this.initFromUrl();
		}
	}

	// Getters for reactive state
	get search(): string {
		return this._search;
	}

	get type(): EntityType | null {
		return this._type;
	}

	get sort(): SortCriteria {
		return this._sort;
	}

	/** Sets the search query */
	setSearch(value: string): void {
		this._search = value;
		if (this.syncUrl) {
			this.updateUrl({ search: value });
		}
	}

	/** Sets the type filter (null for all types) */
	setType(value: EntityTypeInput | null | ''): void {
		if (value === '' || value === null) {
			this._type = null;
		} else {
			const type = normalizeEntityType(value);
			// Validate against allowed types
			if (this.allowedTypes && !this.allowedTypes.includes(type)) {
				this._type = null;
			} else {
				this._type = type;
			}
		}
		if (this.syncUrl) {
			this.updateUrl({ type: this._type?.id ?? '' });
		}
	}

	/** Sets the sort criteria */
	setSort(value: SortCriteriaInput): void {
		const criteria = normalizeSortCriteria(value);
		// Validate against allowed sorts
		if (!this.allowedSorts.includes(criteria)) {
			this._sort = this.defaultSort;
		} else {
			this._sort = criteria;
		}
		if (this.syncUrl) {
			this.updateUrl({ sort: this._sort.type });
		}
	}

	/** Event handler for search input (binds to oninput) */
	onSearchInput = (e: Event & { currentTarget: HTMLInputElement }): void => {
		this.setSearch(e.currentTarget.value);
	};

	/**
	 * Applies filtering and sorting to entities.
	 * Returns either a flat array or grouped results depending on the sort criteria.
	 */
	getResults(entities: Array<Entity>): SortedResult {
		const locale = getLocale();

		// Apply search filter
		const searchFiltered = filterByTitle(entities, this._search, locale);

		// Apply type filter
		const typeFiltered = this._type
			? searchFiltered.filter((entity) => entity.type === this._type)
			: searchFiltered;

		// Apply sorting
		if (this._sort instanceof GroupingCriteria) {
			return { groupedEntities: this._sort.group(typeFiltered, locale) };
		}
		return { entities: this._sort.sort(typeFiltered, locale) };
	}

	/** Initializes state from URL parameters */
	private initFromUrl(): void {
		const url = page.url;

		// Parse search
		this._search = url.searchParams.get(this.searchParam) ?? '';

		// Parse type
		const typeParam = url.searchParams.get(this.typeParam);
		if (typeParam && typeParam in entityTypes) {
			const type = entityTypes[typeParam as EntityTypeId];
			if (!this.allowedTypes || this.allowedTypes.includes(type)) {
				this._type = type;
			} else {
				// Invalid type for this context, clean up URL
				this.updateUrl({ type: '' });
			}
		} else if (typeParam) {
			// Invalid type in URL, clean up
			this.updateUrl({ type: '' });
		}

		// Parse sort
		const sortParam = url.searchParams.get(this.sortParam);
		if (sortParam && sortParam in sortCriteria) {
			const criteria = sortCriteria[sortParam as SortCriteriaType];
			if (this.allowedSorts.includes(criteria)) {
				this._sort = criteria;
			} else {
				// Invalid sort for this context, clean up URL
				this.updateUrl({ sort: this.defaultSort.type });
			}
		} else if (sortParam) {
			// Invalid sort in URL, clean up
			this.updateUrl({ sort: this.defaultSort.type });
		}
	}

	/** Updates URL parameters, removing defaults for clean URLs */
	private updateUrl(params: { sort?: SortCriteriaType; search?: string; type?: string }): void {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- URL used only for manipulation, not reactive binding
		const url = new URL(page.url);

		if (params.sort !== undefined) {
			if (params.sort === this.defaultSort.type) {
				url.searchParams.delete(this.sortParam);
			} else {
				url.searchParams.set(this.sortParam, params.sort);
			}
		}

		if (params.search !== undefined) {
			if (params.search === '') {
				url.searchParams.delete(this.searchParam);
			} else {
				url.searchParams.set(this.searchParam, params.search);
			}
		}

		if (params.type !== undefined) {
			if (params.type === '') {
				url.searchParams.delete(this.typeParam);
			} else {
				url.searchParams.set(this.typeParam, params.type);
			}
		}

		// eslint-disable-next-line svelte/no-navigation-without-resolve -- preserving current URL with query params
		goto(url.toString(), {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}
}
