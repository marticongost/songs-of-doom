<!--
@component
A complete entity catalog with search, filtering, sorting, and grid display.
Combines EntitySearchToolbar and EntityGrid into a single, reusable component.

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
	import EntityGrid from '$lib/components/EntityGrid.svelte';
	import EntitySearchToolbar from '$lib/components/EntitySearchToolbar.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { EntitySearchState } from '$lib/search';
	import type { Entity } from '@songsofdoom/game';
	import type { Component } from 'svelte';

	interface Props extends StandardAttributeProps {
		/** Entities to display and filter */
		entities: Entity[];
		/** Search state instance that manages filtering and URL sync */
		search: EntitySearchState;
		/** Whether to autofocus the search input */
		autofocus?: boolean;
		/** Custom component to render each entity */
		EntityComponent?: Component<{ entity: Entity }>;
	}

	const { entities, search, autofocus = false, EntityComponent, ...attributes }: Props = $props();

	const nav = new KeyboardNavigation({ mode: 'grid' });
	const results = $derived(search.getResults(entities));
</script>

<div {...standardAttributes(attributes, 'entity-catalog')}>
	<EntitySearchToolbar state={search} keyboardNav={nav} {autofocus} />
	<EntityGrid {...results} keyboardNav={nav} {EntityComponent} />
</div>
