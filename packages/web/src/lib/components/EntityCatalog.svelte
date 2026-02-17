<!--
@component
A complete entity catalog with search, filtering, sorting, and grid display.
Combines EntitySearchToolbar and EntityListing into a single, reusable component.

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
	import Card from '$lib/components/Card.svelte';
	import CardButton from '$lib/components/CardButton.svelte';
	import EntityListing from '$lib/components/EntityListing.svelte';
	import EntitySearchToolbar from '$lib/components/EntitySearchToolbar.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { EntitySearchState } from '$lib/search';
	import type { Entity } from '@songsofdoom/game';

	interface Props extends StandardAttributeProps {
		/** Entities to display and filter */
		entities: Entity[];
		/** Search state instance that manages filtering and URL sync */
		search: EntitySearchState;
		/** Whether to autofocus the search input */
		autofocus?: boolean;
	}

	const { entities, search, autofocus = false, ...attributes }: Props = $props();

	const nav = new KeyboardNavigation({ mode: 'grid' });
	const results = $derived(search.getResults(entities));

	// Use custom component if provided, otherwise derive from view state
	const EntityComponent = $derived(search.view === 'button' ? CardButton : Card);
	const appearance = $derived(search.view === 'button' ? 'columns' : 'grid');
</script>

<div {...standardAttributes(attributes, 'entity-catalog')}>
	<EntitySearchToolbar state={search} keyboardNav={nav} {autofocus} />
	<EntityListing {...results} {appearance} keyboardNav={nav} {EntityComponent} />
</div>
