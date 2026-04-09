import { goto } from '$app/navigation';
import { page } from '$app/state';
import { translate, type LocalisedText } from '@songsofdoom/common/localisation';
import {
	entities as allEntities,
	DependencyImpediment,
	entityTypes,
	ParentEntity,
	type CharacterState,
	type Entity,
	type EntityType,
	type EntityTypeId
} from '@songsofdoom/game';
import { SvelteMap } from 'svelte/reactivity';

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

/** Type group for multi-type filtering */
export type TypeGroupId = 'player-cards' | 'danger-cards' | 'stories' | 'locations';

interface TypeGroup {
	id: TypeGroupId;
	label: LocalisedText;
	typeIds: EntityTypeId[];
}

const typeGroups: Record<TypeGroupId, TypeGroup> = {
	'player-cards': {
		id: 'player-cards',
		label: { ca: 'Cartes de jugador', es: 'Cartas de jugador', en: 'Player cards' },
		typeIds: ['archetype', 'skill', 'trait', 'ally', 'item']
	},
	'danger-cards': {
		id: 'danger-cards',
		label: { ca: 'Cartes de perill', es: 'Cartas de peligro', en: 'Danger cards' },
		typeIds: ['encounter', 'creature']
	},
	stories: {
		id: 'stories',
		label: { ca: 'Històries', es: 'Historias', en: 'Stories' },
		typeIds: ['story']
	},
	locations: {
		id: 'locations',
		label: { ca: 'Llocs', es: 'Localizaciones', en: 'Locations' },
		typeIds: ['location']
	}
};

const defaultTypeGroup = typeGroups['player-cards'];

/** View mode for entity display */
export type ViewType = 'card' | 'button';
const viewTypes: ViewType[] = ['card', 'button'];

/** Version filter options */
export type VersionFilter = 'all' | 'base' | 'upgraded';
const versionFilters: VersionFilter[] = ['all', 'base', 'upgraded'];

/** Character status filter options */
export type CharacterFilter = 'any' | 'unlocked' | 'owned' | 'purchaseable' | 'upgradeable';
const characterFilters: CharacterFilter[] = [
	'any',
	'unlocked',
	'owned',
	'purchaseable',
	'upgradeable'
];

/** Option for the view Switch component */
export interface ViewOption {
	value: ViewType;
	icon: string;
	'aria-label': LocalisedText;
}

export interface EntitySearchStateOptions {
	/** Restrict which entity types can be filtered (defaults to all) */
	allowedTypes?: EntityTypeInput[];
	/** Restrict which sort options are available (defaults to all) */
	allowedSorts?: SortCriteriaInput[];
	/** Default sort criteria (defaults to 'alpha') */
	defaultSort?: SortCriteriaInput;
	/** Restrict which views are available (defaults to both) */
	allowedViews?: ViewType[];
	/** Default view mode (defaults to 'card') */
	defaultView?: ViewType;
	/** Sync state with URL params (defaults to true) */
	syncUrl?: boolean;
	/** CharacterState to enable character-specific filtering. If omitted, the filter is hidden. */
	characterState?: CharacterState;
	/** Default character filter value (defaults to 'any') */
	defaultCharacterFilter?: CharacterFilter;
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
	private readonly viewParam = 'view';
	private readonly setParam = 'set';
	private readonly versionParam = 'version';

	// Configuration
	readonly allowedTypes: EntityType[] | undefined;
	private readonly defaultGroup: TypeGroup | null;
	readonly allowedSorts: SortCriteria[];
	readonly defaultSort: SortCriteria;
	readonly allowedViews: ViewType[];
	readonly defaultView: ViewType;
	private readonly syncUrl: boolean;

	// Reactive state
	private _search = $state('');
	private _type = $state<EntityType | TypeGroup | null>(null);
	private _sort = $state<SortCriteria>(sortCriteria.alpha);
	private _view = $state<ViewType>('card');
	private _set = $state<ParentEntity | null>(null);
	private _version = $state<VersionFilter>('all');
	private _setOptions = $state<Array<{ value: string; label: LocalisedText }>>([]);
	private _characterState = $state<CharacterState | undefined>(undefined);
	private _characterFilter = $state<CharacterFilter>('any');

	// Dropdown options (computed once from configuration)
	readonly typeOptions: Array<{ value: string; label: LocalisedText }>;
	readonly sortOptions: Array<{ value: SortCriteriaType; label: LocalisedText }>;
	readonly viewOptions: ViewOption[];
	readonly versionOptions: Array<{ value: VersionFilter; label: LocalisedText }>;
	readonly characterFilterOptions: Array<{ value: CharacterFilter; label: LocalisedText }> | null;

	constructor(options?: EntitySearchStateOptions) {
		// Normalize configuration
		this.allowedTypes = options?.allowedTypes?.map(normalizeEntityType);
		this.allowedSorts =
			options?.allowedSorts?.map(normalizeSortCriteria) ?? Object.values(sortCriteria);
		this.defaultSort = options?.defaultSort
			? normalizeSortCriteria(options.defaultSort)
			: sortCriteria.alpha;
		this.syncUrl = options?.syncUrl ?? true;

		// Initialize view configuration
		this.allowedViews = options?.allowedViews ?? viewTypes;
		this.defaultView = options?.defaultView ?? 'card';
		this._view = this.defaultView;

		// Initialize sort to default
		this._sort = this.defaultSort;

		// Build type filter options
		const types = this.allowedTypes ?? Object.values(entityTypes);
		const locale = getLocale();
		const sortedTypes = [...types].sort((a, b) =>
			(translate(a.pluralTitle, locale) ?? '').localeCompare(translate(b.pluralTitle, locale) ?? '')
		);
		const applicableGroups = Object.values(typeGroups).filter((group) =>
			group.typeIds.every((id) => !this.allowedTypes || this.allowedTypes.some((t) => t.id === id))
		);
		if (applicableGroups.length > 0) {
			this.typeOptions = [
				...applicableGroups.map((g) => ({ value: g.id, label: g.label })),
				...sortedTypes.map((type) => ({ value: type.id, label: type.pluralTitle }))
			];
		} else {
			this.typeOptions = [
				{ value: '', label: { ca: 'Tots els tipus', es: 'Todos los tipos', en: 'All types' } },
				...sortedTypes.map((type) => ({ value: type.id, label: type.pluralTitle }))
			];
		}
		this.defaultGroup =
			applicableGroups.find((g) => g.id === defaultTypeGroup.id) ?? applicableGroups[0] ?? null;

		// Build sort options
		this.sortOptions = this.allowedSorts.map((criteria) => ({
			value: criteria.type,
			label: criteria.label
		}));

		// Build view options for Switch
		const viewLabels: Record<ViewType, LocalisedText> = {
			card: { ca: 'Vista de targetes', es: 'Vista de tarjetas', en: 'Card view' },
			button: { ca: 'Vista de llista', es: 'Vista de lista', en: 'List view' }
		};
		this.viewOptions = this.allowedViews.map((view) => ({
			value: view,
			icon: `views/${view}.svg`,
			'aria-label': viewLabels[view]
		}));

		// Build version filter options
		this.versionOptions = [
			{
				value: 'all',
				label: { ca: 'Totes les versions', es: 'Todas las versiones', en: 'All versions' }
			},
			{ value: 'base', label: { ca: 'Versió base', es: 'Versión base', en: 'Base version' } },
			{
				value: 'upgraded',
				label: {
					ca: 'Versions millorades',
					es: 'Versiones mejoradas',
					en: 'Upgraded versions'
				}
			}
		];

		// Build character filter options (only if characterState was provided)
		const hasCharacterState = options !== undefined && 'characterState' in options;
		this._characterState = options?.characterState;
		this._characterFilter = options?.defaultCharacterFilter ?? 'any';
		this.characterFilterOptions = hasCharacterState
			? [
					{
						value: 'any',
						label: { ca: 'Qualsevol estat', es: 'Cualquier estado', en: 'Any status' }
					},
					{
						value: 'unlocked',
						label: { ca: 'Desbloquejades', es: 'Desbloqueadas', en: 'Unlocked' }
					},
					{ value: 'owned', label: { ca: 'Posseïdes', es: 'En posesión', en: 'Owned' } },
					{
						value: 'purchaseable',
						label: { ca: 'Adquiribles', es: 'Adquiribles', en: 'Purchaseable' }
					},
					{
						value: 'upgradeable',
						label: { ca: 'Millorables', es: 'Mejorables', en: 'Upgradeable' }
					}
				]
			: null;

		// Initialize type to default group (if any group is applicable)
		this._type = this.defaultGroup;

		// Initialize from URL if syncing
		if (this.syncUrl) {
			this.initFromUrl();
		}
	}

	// Getters for reactive state
	get search(): string {
		return this._search;
	}

	get type(): EntityType | TypeGroup | null {
		return this._type;
	}

	get sort(): SortCriteria {
		return this._sort;
	}

	get view(): ViewType {
		return this._view;
	}

	get set(): ParentEntity | null {
		return this._set;
	}

	get version(): VersionFilter {
		return this._version;
	}

	get setOptions(): Array<{ value: string; label: LocalisedText }> {
		return this._setOptions;
	}

	get characterFilter(): CharacterFilter {
		return this._characterFilter;
	}

	/** Sets the search query */
	setSearch(value: string): void {
		this._search = value;
		if (this.syncUrl) {
			this.updateUrl({ search: value });
		}
	}

	/** Sets the type filter */
	setType(value: EntityTypeInput | TypeGroupId | null | ''): void {
		if (value === '' || value === null) {
			this._type = this.defaultGroup;
		} else if (typeof value === 'string' && value in typeGroups) {
			this._type = typeGroups[value as TypeGroupId];
		} else {
			const type = normalizeEntityType(value as EntityTypeInput);
			// Validate against allowed types
			if (this.allowedTypes && !this.allowedTypes.includes(type)) {
				this._type = null;
			} else {
				this._type = type;
			}
		}
		if (this.syncUrl) {
			const isDefault = this._type?.id === this.defaultGroup?.id;
			this.updateUrl({ type: isDefault ? '' : (this._type?.id ?? '') });
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

	/** Sets the view mode */
	setView(value: ViewType): void {
		// Validate against allowed views
		if (!this.allowedViews.includes(value)) {
			this._view = this.defaultView;
		} else {
			this._view = value;
		}
		if (this.syncUrl) {
			this.updateUrl({ view: this._view });
		}
	}

	/** Sets the set filter (empty string or null for all sets) */
	setSet(value: string | null): void {
		if (!value) {
			this._set = null;
		} else {
			const entity = allEntities.get(value);
			this._set = entity instanceof ParentEntity ? entity : null;
		}
		if (this.syncUrl) {
			this.updateUrl({ set: this._set?.id ?? '' });
		}
	}

	/** Sets the version filter */
	setVersion(value: VersionFilter): void {
		this._version = versionFilters.includes(value) ? value : 'all';
		if (this.syncUrl) {
			this.updateUrl({ version: this._version });
		}
	}

	/** Updates the character state for filtering */
	setCharacterState(state: CharacterState | undefined): void {
		this._characterState = state;
	}

	/** Sets the character status filter */
	setCharacterFilter(value: CharacterFilter): void {
		this._characterFilter = characterFilters.includes(value) ? value : 'any';
	}

	/**
	 * Updates the available set options from the entities being displayed.
	 * Call this whenever the entities list changes (e.g., via $effect in EntityCatalog).
	 */
	updateSetOptions(entities: Entity[]): void {
		const locale = getLocale();
		const sets = new SvelteMap<string, ParentEntity>();
		for (const entity of entities) {
			if (entity.set) {
				sets.set(entity.set.id, entity.set);
			}
		}
		const sortedSets = Array.from(sets.values()).sort((a, b) =>
			(translate(a.title, locale) ?? '').localeCompare(translate(b.title, locale) ?? '')
		);
		this._setOptions = [
			{ value: '', label: { ca: 'Tots els conjunts', es: 'Todos los conjuntos', en: 'All sets' } },
			...sortedSets.map((s) => ({ value: s.id, label: s.title }))
		];
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
		const typeFiltered = (() => {
			if (!this._type) return searchFiltered;
			if ('typeIds' in this._type) {
				const typeIds = this._type.typeIds;
				return searchFiltered.filter((entity) => typeIds.includes(entity.type.id));
			}
			return searchFiltered.filter((entity) => entity.type === this._type);
		})();

		// Apply set filter
		const setFiltered = this._set
			? typeFiltered.filter((entity) => entity.set === this._set)
			: typeFiltered;

		// Apply version filter
		const versionFiltered =
			this._version === 'base'
				? setFiltered.filter((entity) => entity.level === 1)
				: this._version === 'upgraded'
					? setFiltered.filter((entity) => entity.level >= 2)
					: setFiltered;

		// Apply character filter
		const cs = this._characterState;
		const characterFiltered = (() => {
			if (!cs) return versionFiltered;
			switch (this._characterFilter) {
				case 'unlocked':
					return versionFiltered.filter((entity) => {
						const imp = cs.getEntityAcquisitionImpediment(entity);
						return !(imp instanceof DependencyImpediment);
					});
				case 'owned':
					return versionFiltered.filter((entity) => cs.getNumberOfOwnedCopies(entity) >= 1);
				case 'purchaseable':
					return versionFiltered.filter((entity) => !cs.getEntityAcquisitionImpediment(entity));
				case 'upgradeable':
					return versionFiltered.filter((entity) => {
						if (cs.getNumberOfOwnedCopies(entity) < 1) return false;
						const next = entity.nextVariant;
						if (!next) return false;
						return !cs.getEntityAcquisitionImpediment(next);
					});
				default:
					return versionFiltered;
			}
		})();

		// Apply sorting
		if (this._sort instanceof GroupingCriteria) {
			return { groupedEntities: this._sort.group(characterFiltered, locale) };
		}
		return { entities: this._sort.sort(characterFiltered, locale) };
	}

	/** Initializes state from URL parameters */
	private initFromUrl(): void {
		const url = page.url;

		// Parse search
		this._search = url.searchParams.get(this.searchParam) ?? '';

		// Parse type
		const typeParam = url.searchParams.get(this.typeParam);
		if (typeParam && typeParam in typeGroups) {
			this._type = typeGroups[typeParam as TypeGroupId];
			if (typeParam === this.defaultGroup?.id) {
				this.updateUrl({ type: '' });
			}
		} else if (typeParam && typeParam in entityTypes) {
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

		// Parse view
		const viewParam = url.searchParams.get(this.viewParam);
		if (viewParam && viewTypes.includes(viewParam as ViewType)) {
			const view = viewParam as ViewType;
			if (this.allowedViews.includes(view)) {
				this._view = view;
			} else {
				// Invalid view for this context, clean up URL
				this.updateUrl({ view: this.defaultView });
			}
		} else if (viewParam) {
			// Invalid view in URL, clean up
			this.updateUrl({ view: this.defaultView });
		}

		// Parse set
		const setParam = url.searchParams.get(this.setParam);
		if (setParam) {
			const entity = allEntities.get(setParam);
			if (entity instanceof ParentEntity) {
				this._set = entity;
			} else {
				// Invalid set in URL, clean up
				this.updateUrl({ set: '' });
			}
		}

		// Parse version
		const versionParam = url.searchParams.get(this.versionParam);
		if (versionParam && versionFilters.includes(versionParam as VersionFilter)) {
			this._version = versionParam as VersionFilter;
		} else if (versionParam) {
			// Invalid version in URL, clean up
			this.updateUrl({ version: 'all' });
		}
	}

	/** Updates URL parameters, removing defaults for clean URLs */
	private updateUrl(params: {
		sort?: SortCriteriaType;
		search?: string;
		type?: string;
		view?: ViewType;
		set?: string;
		version?: VersionFilter;
	}): void {
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

		if (params.view !== undefined) {
			if (params.view === this.defaultView) {
				url.searchParams.delete(this.viewParam);
			} else {
				url.searchParams.set(this.viewParam, params.view);
			}
		}

		if (params.set !== undefined) {
			if (params.set === '') {
				url.searchParams.delete(this.setParam);
			} else {
				url.searchParams.set(this.setParam, params.set);
			}
		}

		if (params.version !== undefined) {
			if (params.version === 'all') {
				url.searchParams.delete(this.versionParam);
			} else {
				url.searchParams.set(this.versionParam, params.version);
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
