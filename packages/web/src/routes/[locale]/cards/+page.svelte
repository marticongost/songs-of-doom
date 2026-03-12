<script lang="ts">
	import EntityCatalog from '$lib/components/entities/EntityCatalog.svelte';
	import { EntitySearchState } from '$lib/search';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const searchState = new EntitySearchState({
		allowedTypes: [
			'scenario',
			'story',
			'archetype',
			'trait',
			'skill',
			'item',
			'creature',
			'ally',
			'encounter'
		]
	});
</script>

<EntityCatalog entities={data.entities} search={searchState} autofocus />
