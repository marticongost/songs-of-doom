<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import EntityGrid from '$lib/components/EntityGrid.svelte';
	import SearchInput from '$lib/components/forms/SearchInput.svelte';
	import SortDropdown from '$lib/components/SortDropdown.svelte';
	import { filterByTitle } from '$lib/search';
	import {
		sortCriteria,
		sortedEntities as sortEntities,
		sortOptions,
		type SortCriteriaType
	} from '$lib/sorting';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// URL parameter names
	const sortParam = 'sort';
	const searchParam = 'q';

	// Defaults
	const defaultSort: SortCriteriaType = 'alpha';

	function updateUrl(params: { sort?: SortCriteriaType; search?: string }) {
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

	// Apply filtering then sorting
	const filtered = $derived(filterByTitle(data.entities, currentSearch, data.locale));
	const sorted = $derived(sortEntities(filtered, currentSort, data.locale));

	function onSortChange(value: SortCriteriaType) {
		updateUrl({ sort: value });
	}

	function onSearchInput(e: Event & { currentTarget: HTMLInputElement }) {
		updateUrl({ search: e.currentTarget.value });
	}
</script>

<div class="toolbar">
	<SearchInput
		value={currentSearch}
		oninput={onSearchInput}
		autofocus
		placeholder={{ ca: 'Cercar cartes...', es: 'Buscar cartas...', en: 'Search cards...' }}
	/>
	<SortDropdown options={sortOptions} value={currentSort} onChange={onSortChange} />
</div>

<EntityGrid entities={sorted} />

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.toolbar {
		@include rz.row(md);
		margin-bottom: rz.size(lg);
		align-items: center;
	}
</style>
