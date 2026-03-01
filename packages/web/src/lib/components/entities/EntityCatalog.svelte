<!--
@component
A complete entity catalog with search, filtering, sorting, and grid display.
Combines EntitySearchToolbar and EntityListing into a single, reusable component.
Optionally includes a carousel viewer for browsing entities when an EntityManager is provided.

@example
```svelte
<script>
  import { EntitySearchState } from '$lib/search';
  const searchState = new EntitySearchState();
</script>

<EntityCatalog entities={data.entities} search={searchState} autofocus />
```
-->
<script lang="ts">
	import { KeyboardNavigation } from '$lib/attachments/keyboard-nav';
	import { EntitySearchState } from '$lib/search';
	import type { Entity } from '@songsofdoom/game';
	import EntitySearchToolbar from '../EntitySearchToolbar.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import EntityListing from './EntityListing.svelte';
	import type { EntityManager } from './entitymanager';

	interface Props extends StandardAttributeProps {
		/** Entities to display and filter */
		entities: Entity[];

		/** Search state instance that manages filtering and URL sync */
		search: EntitySearchState;

		/** Whether to autofocus the search input */
		autofocus?: boolean;

		/** Optional entity manager - enables carousel when provided */
		entityManager?: EntityManager;

		/** Whether to visually dim unavailable entities. */
		dimUnavailableEntities?: boolean;
	}

	const {
		entities,
		search,
		autofocus = false,
		entityManager,
		dimUnavailableEntities = false,
		...attributes
	}: Props = $props();

	const nav = new KeyboardNavigation({ mode: 'grid', itemSelector: '[data-entity]' });
	const results = $derived(search.getResults(entities));

	$effect(() => {
		search.updateSetOptions(entities);
	});

	// Use custom component if provided, otherwise derive from view state
	const appearance = $derived(search.view === 'button' ? 'button-columns' : 'card-grid');

	let toolbar: EntitySearchToolbar | undefined;
	let catalogElement: HTMLDivElement | undefined;

	export function scrollIntoViewAndFocus() {
		catalogElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		setTimeout(() => {
			toolbar?.focusSearchInput();
		}, 300);
	}
</script>

<div bind:this={catalogElement} {...standardAttributes(attributes, 'entity-catalog')}>
	<EntitySearchToolbar bind:this={toolbar} state={search} keyboardNav={nav} {autofocus} />
	<EntityListing
		{...results}
		{appearance}
		keyboardNav={nav}
		{entityManager}
		{dimUnavailableEntities}
	/>
</div>
