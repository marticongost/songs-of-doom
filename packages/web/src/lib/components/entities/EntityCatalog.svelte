<!--
@component
A complete entity catalog with search, filtering, sorting, and grid display.
Combines EntitySearchToolbar and EntityListing into a single, reusable component.
Optionally includes a carousel viewer for browsing entities.

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
	import Card from '../Card.svelte';
	import CardButton from '../CardButton.svelte';
	import EntitySearchToolbar from '../EntitySearchToolbar.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import EntityCarousel, { type EntityCarouselApi } from './EntityCarousel.svelte';
	import EntityListing from './EntityListing.svelte';
	import { EntitySearchState } from '$lib/search';
	import type { Entity } from '@songsofdoom/game';
	import type { Snippet } from 'svelte';

	interface Props extends StandardAttributeProps {
		/** Entities to display and filter */
		entities: Entity[];
		/** Search state instance that manages filtering and URL sync */
		search: EntitySearchState;
		/** Whether to autofocus the search input */
		autofocus?: boolean;
		/** Enable carousel viewer on entity click (default: true) */
		enableCarousel?: boolean;
		/** Additional action buttons for the carousel, receives current entity */
		actions?: Snippet<[Entity]>;
	}

	const {
		entities,
		search,
		autofocus = false,
		enableCarousel = true,
		actions,
		...attributes
	}: Props = $props();

	let carouselRef: EntityCarouselApi | undefined = $state();

	const nav = new KeyboardNavigation({ mode: 'grid' });
	const results = $derived(search.getResults(entities));

	// Flatten results for carousel consumption
	const carouselEntities = $derived.by(() => {
		if (results.groupedEntities) {
			return results.groupedEntities.flatMap((g) => g.entities);
		}
		return results.entities ?? [];
	});

	// Use custom component if provided, otherwise derive from view state
	const EntityComponent = $derived(search.view === 'button' ? CardButton : Card);
	const appearance = $derived(search.view === 'button' ? 'columns' : 'grid');

	function handleEntityClick(_entity: Entity, index: number): void {
		carouselRef?.open(index);
	}
</script>

<div {...standardAttributes(attributes, 'entity-catalog')}>
	<EntitySearchToolbar state={search} keyboardNav={nav} {autofocus} />
	<EntityListing
		{...results}
		{appearance}
		keyboardNav={nav}
		{EntityComponent}
		onEntityClick={enableCarousel ? handleEntityClick : undefined}
	/>
</div>

{#if enableCarousel}
	<EntityCarousel bind:this={carouselRef} entities={carouselEntities} {actions} />
{/if}
