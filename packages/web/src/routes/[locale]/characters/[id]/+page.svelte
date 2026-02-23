<script lang="ts">
	import StatsSheet from '$lib/components/StatsSheet.svelte';
	import EntityCatalog from '$lib/components/entities/EntityCatalog.svelte';
	import EntityListing from '$lib/components/entities/EntityListing.svelte';
	import type { EntityManager } from '$lib/components/entities/entitymanager';
	import ExperienceIndicator from '$lib/components/indicators/ExperienceIndicator.svelte';
	import GoldIndicator from '$lib/components/indicators/GoldIndicator.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import Toolbar from '$lib/components/toolbar/Toolbar.svelte';
	import ToolbarButton from '$lib/components/toolbar/ToolbarButton.svelte';
	import { EntitySearchState } from '$lib/search';
	import { type LocalisedText } from '@songsofdoom/common';
	import {
		attributeTypes,
		entities,
		indicatorTypes,
		type Entity,
		type EntityTypeId
	} from '@songsofdoom/game';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	// All entities except modules
	const { character } = data;
	let characterState = $state(character.newestRevision.state);
	const baseStats = $derived(characterState.getBaseStats());
	const allowedTypes: EntityTypeId[] = ['archetype', 'trait', 'skill', 'item', 'ally'];
	const allEntities = entities.all().filter((e) => allowedTypes.includes(e.type.id));

	const searchState = new EntitySearchState({
		allowedTypes,
		syncUrl: false
	});

	const entityManager: EntityManager = {
		getNumberOfOwnedCopies(entity) {
			return characterState.getNumberOfOwnedCopies(entity);
		},
		getAcquisitionImpediment(entity) {
			return characterState.getEntityAcquisitionImpediment(entity);
		},
		onEntityAdded(entity) {
			characterState = characterState.acquireEntity(entity);
		},
		onEntityRemoved(entity) {
			characterState = characterState.returnEntity(entity);
		}
	};
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
	<div class="details">
		<section class="stats">
			<h1 class="section-title">
				<Text ca="Característiques" es="Características" en="Stats" />
			</h1>
			<div class="stats-sheet">
				<StatsSheet stats={baseStats} statTypes={attributeTypes} showLabels={true} />
				<StatsSheet stats={baseStats} statTypes={indicatorTypes} showLabels={true} />
			</div>
		</section>
	</div>
	<div class="build">
		{@render cardSet(
			{ ca: 'Arquetips', es: 'Arquetipos', en: 'Archetypes' },
			characterState.archetypes()
		)}
		{@render cardSet({ ca: 'Trets', es: 'Rasgos', en: 'Traits' }, characterState.traits())}
		{@render cardSet(
			{ ca: 'Habilitats', es: 'Habilidades', en: 'Skills' },
			characterState.skills()
		)}
		{@render cardSet({ ca: 'Aliats', es: 'Aliados', en: 'Allies' }, characterState.allies())}
		{@render cardSet({ ca: 'Objectes', es: 'Objetos', en: 'Items' }, characterState.items())}
	</div>
	<section class="catalog">
		<h1 class="section-title"><Text ca="Afegir cartes" es="Añadir cartas" en="Add cards" /></h1>
		<EntityCatalog entities={allEntities} search={searchState} {entityManager} />
	</section>
</div>

{#snippet cardSet(title: LocalisedText, entities: Entity[])}
	<section class="card-set">
		<h1 class="section-title"><Text {...title} /></h1>
		<EntityListing {entities} {entityManager} appearance="button-columns" />
	</section>
{/snippet}

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.character-name {
		font-family: var(--heading-font);
		color: var(--text-heading-color);
		padding: rz.size(md);
		margin-right: rz.size(lg);
	}

	.section-title {
		font-family: var(--heading-font);
		font-size: 1.3em;
		color: var(--text-heading-color);
		margin-bottom: rz.size(md);
	}

	.resources {
		@include rz.row(sm);
		margin-left: auto;
		padding: rz.size(md);
		font-size: 1.5em;
	}

	.content {
		@include rz.row(xl);
		@include rz.hpadding(md);
		border: 2px solid transparent;
		margin-top: rz.size(lg);
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

	.details {
		flex: 0 0 auto;
	}

	.build {
		@include rz.column(lg);
		flex: 0 0 20em;
	}

	.catalog {
		flex: 1 1 auto;
	}
</style>
