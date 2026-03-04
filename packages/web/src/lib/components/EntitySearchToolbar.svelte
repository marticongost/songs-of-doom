<!--
@component
A toolbar for filtering and sorting entities. Includes a search input,
entity type filter dropdown, and sort criteria dropdown.

@example
```svelte
<EntitySearchToolbar state={searchState} autofocus />
```
-->
<script lang="ts">
	import type { KeyboardNavigation } from '$lib/attachments/keyboard-nav';
	import Dropdown from '$lib/components/forms/Dropdown.svelte';
	import SearchInput from '$lib/components/forms/SearchInput.svelte';
	import Switch from '$lib/components/forms/Switch.svelte';
	import SortDropdown from '$lib/components/SortDropdown.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import {
		EntitySearchState,
		type CharacterFilter,
		type VersionFilter,
		type ViewType
	} from '$lib/search';
	import type { SortCriteriaType } from '$lib/sorting';
	import type { EntityTypeId } from '@songsofdoom/game';

	interface Props extends StandardAttributeProps {
		/** Search state instance that manages filtering and URL sync */
		state: EntitySearchState;
		/** Optional keyboard navigation for search input */
		keyboardNav?: KeyboardNavigation;
		/** Whether to autofocus the search input */
		autofocus?: boolean;
	}

	const { state, keyboardNav, autofocus = false, ...attributes }: Props = $props();

	let searchInput: SearchInput | undefined;

	export function focusSearchInput() {
		searchInput?.focus();
	}

	function onTypeChange(value: string) {
		state.setType(value === '' ? null : (value as EntityTypeId));
	}

	function onSortChange(value: SortCriteriaType) {
		state.setSort(value);
	}

	function onViewChange(value: ViewType) {
		state.setView(value);
	}

	function onSetChange(value: string) {
		state.setSet(value === '' ? null : value);
	}

	function onVersionChange(value: string) {
		state.setVersion(value as VersionFilter);
	}

	function onCharacterFilterChange(value: string) {
		state.setCharacterFilter(value as CharacterFilter);
	}
</script>

<div {...standardAttributes(attributes, 'entity-search-toolbar')}>
	<SearchInput
		bind:this={searchInput}
		{@attach keyboardNav?.searchInputAttachment()}
		value={state.search}
		oninput={state.onSearchInput}
		{autofocus}
	/>
	<Dropdown options={state.typeOptions} value={state.type?.id ?? ''} onChange={onTypeChange} />
	{#if state.setOptions.length > 1}
		<Dropdown options={state.setOptions} value={state.set?.id ?? ''} onChange={onSetChange} />
	{/if}
	<Dropdown options={state.versionOptions} value={state.version} onChange={onVersionChange} />
	{#if state.characterFilterOptions !== null}
		<Dropdown
			options={state.characterFilterOptions}
			value={state.characterFilter}
			onChange={onCharacterFilterChange}
		/>
	{/if}
	<SortDropdown options={state.sortOptions} value={state.sort.type} onChange={onSortChange} />
	{#if state.viewOptions.length > 1}
		<Switch
			options={state.viewOptions}
			value={state.view}
			onchange={onViewChange}
			aria-label={{ ca: 'Mode de visualització', es: 'Modo de visualización', en: 'View mode' }}
		/>
	{/if}
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.entity-search-toolbar {
		@include rz.row(md);
		margin-bottom: rz.size(lg);
		align-items: center;
	}
</style>
