<script lang="ts">
	import EntityCatalog from '$lib/components/EntityCatalog.svelte';
	import { EntitySearchState } from '$lib/search';
	import { entities, Module } from '@songsofdoom/game';
	import type { PageData } from './$types';

	let { data: _data }: { data: PageData } = $props();

	// All entities except modules
	const allEntities = entities.all().filter((e) => !(e instanceof Module));

	const searchState = new EntitySearchState({
		allowedTypes: ['archetype', 'trait', 'skill', 'item', 'ally'],
		syncUrl: false
	});
</script>

<EntityCatalog entities={allEntities} search={searchState} />

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	h1 {
		font-family: var(--heading-font);
		color: var(--text-heading-color);
		margin-bottom: rz.size(lg);
	}
</style>
