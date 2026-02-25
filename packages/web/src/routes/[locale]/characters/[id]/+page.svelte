<script lang="ts">
	import IconButton from '$lib/components/IconButton.svelte';
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
	const allEntities = entities
		.all()
		.filter((e) => allowedTypes.includes(e.type.id) && !e.isStandard());

	const searchState = new EntitySearchState({
		allowedTypes,
		syncUrl: false
	});

	let catalog: EntityCatalog | undefined;

	function handleFilterClick(entityTypeId: EntityTypeId) {
		searchState.setType(entityTypeId);
		catalog?.scrollIntoViewAndFocus();
	}

	const entityManager: EntityManager = {
		getNumberOfOwnedCopies(entity) {
			return characterState.getNumberOfOwnedCopies(entity);
		},
		getAcquisitionImpediment(entity, options) {
			return characterState.getEntityAcquisitionImpediment(entity, options);
		},
		getRemovalImpediment(entity) {
			return characterState.getEntityRemovalImpediment(entity);
		},
		getMissingDependencies(entity) {
			return characterState.getMissingDependencies(entity);
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
			characterState.archetypes(),
			'archetype'
		)}
		{@render cardSet({ ca: 'Trets', es: 'Rasgos', en: 'Traits' }, characterState.traits(), 'trait')}
		{@render cardSet(
			{ ca: 'Habilitats', es: 'Habilidades', en: 'Skills' },
			characterState.skills(),
			'skill',
			characterState.skillDeckSize
		)}
		{@render cardSet(
			{ ca: 'Aliats', es: 'Aliados', en: 'Allies' },
			characterState.allies(),
			'ally'
		)}
		{@render cardSet(
			{ ca: 'Objectes', es: 'Objetos', en: 'Items' },
			characterState.items(),
			'item'
		)}
	</div>
	<section class="catalog">
		<h1 class="section-title"><Text ca="Afegir cartes" es="Añadir cartas" en="Add cards" /></h1>
		<EntityCatalog
			bind:this={catalog}
			entities={allEntities}
			search={searchState}
			dimUnavailableEntities={true}
			{entityManager}
		/>
	</section>
</div>

{#snippet cardSet(
	title: LocalisedText,
	entities: Entity[],
	entityTypeId: EntityTypeId,
	expectedSize: number | undefined = undefined
)}
	<section class="card-set">
		<div class="card-set-header">
			<h1 class="section-title"><Text {...title} /></h1>
			<span class="card-set-size">
				{entities.length}
				{#if expectedSize !== undefined}
					/ {expectedSize}
				{/if}
			</span>
			<IconButton
				src="funnel.svg"
				aria-label={{
					ca: `Filtrar ${title.ca}`,
					es: `Filtrar ${title.es}`,
					en: `Filter ${title.en}`
				}}
				onclick={() => handleFilterClick(entityTypeId)}
			/>
		</div>
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

	.card-set-header {
		@include rz.row(sm);
		padding-bottom: rz.size(sm);
		border-bottom: var(--panel-separator);
		margin-bottom: rz.size(md);
	}

	.card-set-header .section-title {
		margin-bottom: 0;
	}

	.card-set-header :global(.icon-button) {
		position: relative;
		top: -0.1em;
		--svg-height: 0.8em;
		opacity: 0.3;

		&:hover {
			opacity: 1;
		}
	}

	.card-set-size {
		margin-left: auto;
		font-family: var(--number-font);
		font-weight: bold;
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
