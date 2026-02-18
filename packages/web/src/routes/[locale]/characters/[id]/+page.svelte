<script lang="ts">
	import EntityCatalog from '$lib/components/entities/EntityCatalog.svelte';
	import { EntitySearchState } from '$lib/search';
	import { entities, type EntityTypeId } from '@songsofdoom/game';
	import type { PageData } from './$types';

	let { data: _data }: { data: PageData } = $props();

	// All entities except modules
	const allowedTypes: EntityTypeId[] = ['archetype', 'trait', 'skill', 'item', 'ally'];
	const allEntities = entities.all().filter((e) => allowedTypes.includes(e.type.id));

	const searchState = new EntitySearchState({
		allowedTypes,
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
