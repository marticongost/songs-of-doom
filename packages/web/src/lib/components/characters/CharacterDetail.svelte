<!--
@component
Character detail sheet displaying stats, focuses, and card sets.
Used by both the read-only character view and the edit view.

@prop character - The character to display.
@prop characterState - Current character state; may be reactive in edit mode.
@prop entityManager - When provided, enables add/remove in card set listings.
@prop onFilterClick - When provided, shows a filter button in each card set header.
@prop cardSetsLayout - Layout for the card sets: `multi-column` arranges them in three columns; `single-column` stacks them vertically in a narrow panel.
@prop toolbarActions - Snippet rendered between the character name and resources.
@prop catalog - When provided, renders an "Add cards" section after the build area.
-->
<script lang="ts">
	import EntityListing from '$lib/components/entities/EntityListing.svelte';
	import type { EntityManager } from '$lib/components/entities/entitymanager';
	import FocusBag from '$lib/components/focuses/FocusBag.svelte';
	import IconButton from '$lib/components/IconButton.svelte';
	import ExperienceIndicator from '$lib/components/indicators/ExperienceIndicator.svelte';
	import GoldIndicator from '$lib/components/indicators/GoldIndicator.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import StatsSheet from '$lib/components/StatsSheet.svelte';
	import Toolbar from '$lib/components/toolbar/Toolbar.svelte';
	import type { Character } from '$lib/models/characters';
	import type { LocalisedText } from '@songsofdoom/common';
	import {
		attributeTypes,
		indicatorTypes,
		type CharacterState,
		type Entity,
		type EntityTypeId
	} from '@songsofdoom/game';
	import type { Snippet } from 'svelte';

	interface Props {
		character: Character;
		/** Current character state; may be reactive in edit mode. */
		characterState: CharacterState;
		/** When provided, enables add/remove in card set listings. */
		entityManager?: EntityManager;
		/** When provided, shows a filter button in each card set header. */
		onFilterClick?: (entityTypeId: EntityTypeId) => void;
		/** Layout for the card sets: `multi-column` arranges them in three columns; `single-column` stacks them vertically in a narrow panel. */
		cardSetsLayout: 'single-column' | 'multi-column';
		/** Snippet rendered between the character name and the resources. */
		toolbarActions?: Snippet;
		/** When provided, renders an "Add cards" section after the build area. */
		catalog?: Snippet;
	}

	const {
		character,
		characterState,
		entityManager,
		onFilterClick,
		cardSetsLayout,
		toolbarActions,
		catalog
	}: Props = $props();

	const baseStats = $derived(characterState.getBaseStats());

	function sumCopiesOfEntities(entities: Entity[]): number {
		return entities.reduce((sum, e) => sum + characterState.getNumberOfOwnedCopies(e), 0);
	}
</script>

<Toolbar>
	<h1 class="character-name">{character.name}</h1>
	{@render toolbarActions?.()}
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
		<section class="focuses">
			<h1 class="section-title">
				<Text ca="Bossa de focus" es="Bolsa de focos" en="Focuses bag" />
			</h1>
			<div class="focuses-list">
				<FocusBag focuses={characterState.getFocusTokens()} />
			</div>
		</section>
	</div>
	<div class="card-sets" data-layout={cardSetsLayout}>
		<div class="card-column">
			{@render cardSet(
				{ ca: 'Arquetips', es: 'Arquetipos', en: 'Archetypes' },
				characterState.archetypes(),
				'archetype'
			)}
			{@render cardSet(
				{ ca: 'Trets', es: 'Rasgos', en: 'Traits' },
				characterState.traits(),
				'trait'
			)}
		</div>
		<div class="card-column">
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
		<div class="card-column">
			{@render cardSet(
				{ ca: 'Habilitats', es: 'Habilidades', en: 'Skills' },
				characterState.skills(),
				'skill',
				characterState.skillDeckSize
			)}
		</div>
	</div>
	{#if catalog}
		<section class="catalog">
			<h1 class="section-title">
				<Text ca="Afegir cartes" es="Añadir cartas" en="Add cards" />
			</h1>
			{@render catalog()}
		</section>
	{/if}
</div>

{#snippet cardSet(
	title: LocalisedText,
	entities: Entity[],
	entityTypeId: EntityTypeId,
	expectedSize?: number
)}
	<section class="card-set" data-type={entityTypeId}>
		<div class="card-set-header">
			<h1 class="section-title"><Text {...title} /></h1>
			<span class="card-set-size">
				{sumCopiesOfEntities(entities)}
				{#if expectedSize !== undefined}
					/ {expectedSize}
				{/if}
			</span>
			{#if onFilterClick}
				<IconButton
					src="funnel.svg"
					aria-label={{
						ca: `Filtrar ${title.ca}`,
						es: `Filtrar ${title.es}`,
						en: `Filter ${title.en}`
					}}
					onclick={() => onFilterClick(entityTypeId)}
				/>
			{/if}
		</div>
		<EntityListing
			{entities}
			{entityManager}
			viewOnly={!entityManager}
			appearance="button-columns"
		/>
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

	.focuses {
		margin-top: rz.size(lg);
	}

	.details {
		flex: 0 0 auto;
	}

	.catalog {
		flex: 1 1 auto;
	}

	.card-sets :global(.entities.columns) {
		column-count: 1;
	}

	.card-sets {
		&[data-layout='multi-column'] {
			@include rz.row(xl);
			align-items: start;
			flex: 0 0 auto;
		}

		&[data-layout='single-column'] {
			@include rz.column(lg);
			flex: 0 0 20em;
		}
	}

	.card-column {
		@include rz.column(lg);
		width: 20em;
	}
</style>
