<script lang="ts">
	import StatsSheet from '$lib/components/StatsSheet.svelte';
	import EntityCatalog from '$lib/components/entities/EntityCatalog.svelte';
	import ExperienceIndicator from '$lib/components/indicators/ExperienceIndicator.svelte';
	import GoldIndicator from '$lib/components/indicators/GoldIndicator.svelte';
	import Toolbar from '$lib/components/toolbar/Toolbar.svelte';
	import ToolbarButton from '$lib/components/toolbar/ToolbarButton.svelte';
	import { EntitySearchState } from '$lib/search';
	import { attributeTypes, entities, indicatorTypes, type EntityTypeId } from '@songsofdoom/game';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	// All entities except modules
	const { character } = data;
	const characterState = $derived(character.newestRevision.state);
	const baseStats = $derived(characterState.getBaseStats());
	const allowedTypes: EntityTypeId[] = ['archetype', 'trait', 'skill', 'item', 'ally'];
	const allEntities = entities.all().filter((e) => allowedTypes.includes(e.type.id));

	const searchState = new EntitySearchState({
		allowedTypes,
		syncUrl: false
	});
</script>

<Toolbar>
	<h1 class="character-name">{character.name}</h1>
	<ToolbarButton icon="accept.svg" label={{ ca: 'Desar', es: 'Guardar', en: 'Save' }} />
	<ToolbarButton icon="revert.svg" label={{ ca: 'Revertir', es: 'Revertir', en: 'Revert' }} />
	<ToolbarButton
		icon="finalize.svg"
		label={{ ca: 'Finalitzar', es: 'Finalizar', en: 'Finalize' }}
	/>
	<div class="resources">
		<GoldIndicator amount={characterState.gold} />
		<ExperienceIndicator amount={characterState.availableXp} />
	</div>
</Toolbar>

<div class="content">
	<div class="build">
		<div class="stats-sheet">
			<StatsSheet stats={baseStats} statTypes={attributeTypes} showLabels={true} />
			<StatsSheet stats={baseStats} statTypes={indicatorTypes} showLabels={true} />
		</div>
	</div>
	<div class="catalog">
		<EntityCatalog entities={allEntities} search={searchState} />
	</div>
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.character-name {
		font-family: var(--heading-font);
		color: var(--text-heading-color);
		padding: rz.size(md);
		margin-right: rz.size(lg);
	}

	.resources {
		@include rz.row(sm);
		margin-left: auto;
		padding: rz.size(md);
		font-size: 1.5em;
	}

	.content {
		margin-top: rz.size(lg);
		@include rz.row(lg);
		align-items: flex-start;
	}

	.stats-sheet {
		@include rz.column;

		& > :global(* + *) {
			margin-top: rz.size(md);
			padding-top: rz.size(md);
			border-top: var(--panel-separator);
		}
	}
</style>
