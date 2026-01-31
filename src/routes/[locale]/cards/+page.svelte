<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import EntityGrid from '$lib/components/EntityGrid.svelte';
	import SortDropdown from '$lib/components/SortDropdown.svelte';
	import {
		sortCriteria,
		sortedEntities as sortEntities,
		sortOptions,
		type SortCriteriaType
	} from '$lib/sorting';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const defaultSort: SortCriteriaType = 'alpha';
	const sortParam = 'sort';

	const currentSort = $derived(
		(() => {
			const param = page.url.searchParams.get(sortParam);
			return param && param in sortCriteria ? (param as SortCriteriaType) : defaultSort;
		})()
	);

	const sorted = $derived(sortEntities(data.entities, currentSort, data.locale));

	function onSortChange(value: SortCriteriaType) {
		const search = value === defaultSort ? '' : `?${sortParam}=${value}`;
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- appending query params to a resolved route
		goto(resolve('/[locale]/cards', { locale: data.locale }) + search, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}
</script>

<div class="toolbar">
	<SortDropdown options={sortOptions} value={currentSort} onChange={onSortChange} />
</div>

<EntityGrid entities={sorted} />

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.toolbar {
		@include rz.row(md);
		margin-bottom: rz.size(lg);
	}
</style>
