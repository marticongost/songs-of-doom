<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { KeyboardNavigation } from '$lib/attachments/keyboard-nav';
	import { entityTypes, type EntityTypeId } from '$lib/catalog/models/properties/entitytypes';
	import EntityGrid from '$lib/components/EntityGrid.svelte';
	import Dropdown from '$lib/components/forms/Dropdown.svelte';
	import SearchInput from '$lib/components/forms/SearchInput.svelte';
	import SortDropdown from '$lib/components/SortDropdown.svelte';
	import { translate } from '$lib/localisation';
	import { filterByTitle } from '$lib/search';
	import {
		sortCriteria,
		sortedEntities as sortEntities,
		sortOptions,
		type SortCriteriaType
	} from '$lib/sorting';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const nav = new KeyboardNavigation({ mode: 'grid' });

	// URL parameter names
	const sortParam = 'sort';
	const searchParam = 'q';
	const typeParam = 'type';

	// Defaults
	const defaultSort: SortCriteriaType = 'alpha';

	// Type filter options (sorted alphabetically by localized label)
	const typeOptions = $derived([
		{ value: '', label: { ca: 'Tots els tipus', es: 'Todos los tipos', en: 'All types' } },
		...Object.entries(entityTypes)
			.map(([id, type]) => ({ value: id, label: type.pluralTitle }))
			.sort((a, b) =>
				translate(a.label, data.locale).localeCompare(translate(b.label, data.locale))
			)
	]);

	function updateUrl(params: { sort?: SortCriteriaType; search?: string; type?: string }) {
		const url = new URL(page.url);

		// Update sort param
		if (params.sort !== undefined) {
			if (params.sort === defaultSort) {
				url.searchParams.delete(sortParam);
			} else {
				url.searchParams.set(sortParam, params.sort);
			}
		}

		// Update search param
		if (params.search !== undefined) {
			if (params.search === '') {
				url.searchParams.delete(searchParam);
			} else {
				url.searchParams.set(searchParam, params.search);
			}
		}

		// Update type param
		if (params.type !== undefined) {
			if (params.type === '') {
				url.searchParams.delete(typeParam);
			} else {
				url.searchParams.set(typeParam, params.type);
			}
		}

		// eslint-disable-next-line svelte/no-navigation-without-resolve -- preserving current URL with query params
		goto(url.toString(), {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}

	// Derive current values from URL
	const currentSort = $derived(
		(() => {
			const param = page.url.searchParams.get(sortParam);
			return param && param in sortCriteria ? (param as SortCriteriaType) : defaultSort;
		})()
	);

	const currentSearch = $derived(page.url.searchParams.get(searchParam) ?? '');

	const currentType = $derived(
		(() => {
			const param = page.url.searchParams.get(typeParam);
			if (param && param in entityTypes) {
				return param as EntityTypeId;
			}
			// Invalid type in URL: remove it
			if (param) {
				const url = new URL(page.url);
				url.searchParams.delete(typeParam);
				// eslint-disable-next-line svelte/no-navigation-without-resolve -- cleaning up invalid URL param
				goto(url.toString(), { replaceState: true, noScroll: true, keepFocus: true });
			}
			return '';
		})()
	);

	// Apply filtering then sorting
	const searchFiltered = $derived(filterByTitle(data.entities, currentSearch, data.locale));
	const typeFiltered = $derived(
		currentType ? searchFiltered.filter((entity) => entity.type.id === currentType) : searchFiltered
	);
	const sorted = $derived(sortEntities(typeFiltered, currentSort, data.locale));

	function onSortChange(value: SortCriteriaType) {
		updateUrl({ sort: value });
	}

	function onSearchInput(e: Event & { currentTarget: HTMLInputElement }) {
		updateUrl({ search: e.currentTarget.value });
	}

	function onTypeChange(value: string) {
		updateUrl({ type: value });
	}
</script>

<div class="toolbar">
	<SearchInput
		{@attach nav.searchInputAttachment()}
		value={currentSearch}
		oninput={onSearchInput}
		autofocus
		placeholder={{ ca: 'Cercar cartes...', es: 'Buscar cartas...', en: 'Search cards...' }}
	/>
	<Dropdown options={typeOptions} value={currentType} onChange={onTypeChange} />
	<SortDropdown options={sortOptions} value={currentSort} onChange={onSortChange} />
</div>

<EntityGrid entities={sorted} keyboardNav={nav} />

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.toolbar {
		@include rz.row(md);
		margin-bottom: rz.size(lg);
		align-items: center;
	}
</style>
