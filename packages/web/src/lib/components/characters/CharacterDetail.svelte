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
<script lang="ts" module>
	import * as css from '$lib/styles';

	type CardSetsLayout = 'single-column' | 'multi-column';

	const styles = css.styles({
		characterName: {
			fontFamily: css.fonts.heading,
			color: css.text.headingColor,
			padding: css.spacing.md,
			marginRight: css.spacing.lg
		},
		cardSetHeader: {
			...css.row('sm'),
			paddingBottom: css.spacing.sm,
			borderBottom: css.separators.regularBorder,
			marginBottom: css.spacing.md
		},
		cardSetFilterButton: {
			position: 'relative',
			top: '-0.1em',
			'--svg-height': '0.8em',
			opacity: '0.3',
			'&:hover': {
				opacity: '1'
			}
		},
		cardSetSize: {
			marginLeft: 'auto',
			fontFamily: css.fonts.number,
			fontWeight: 'bold'
		},
		sectionTitle: {
			fontFamily: css.fonts.heading,
			fontSize: '1.3em',
			color: css.text.headingColor,
			marginBottom: css.spacing.md
		},
		resources: {
			...css.row('sm'),
			marginLeft: 'auto',
			padding: css.spacing.md,
			fontSize: '1.5em'
		},
		content: {
			...css.row('xl'),
			...css.hpadding('md'),
			border: '2px solid transparent',
			marginTop: css.spacing.lg,
			alignItems: 'flex-start'
		},
		statsSheet: {
			...css.column(),
			'& > * + *': {
				marginTop: css.spacing.md,
				paddingTop: css.spacing.md,
				borderTop: css.separators.regularBorder
			}
		},
		focuses: {
			marginTop: css.spacing.lg
		},
		details: {
			flex: '0 0 auto'
		},
		catalog: {
			flex: '1 1 auto'
		},
		cardColumn: {
			...css.column('lg'),
			width: '20em'
		},
		cardSetTitle: {
			fontFamily: css.fonts.heading,
			fontSize: '1.3em',
			color: css.text.headingColor,
			marginBottom: 0
		}
	});

	const cardSetsLayoutStyles: Record<CardSetsLayout, ReturnType<typeof css.styles>> = {
		'single-column': css.styles({
			cardSets: {
				...css.column('lg'),
				flex: '0 0 20em'
			}
		}),
		'multi-column': css.styles({
			cardSets: {
				...css.row('xl'),
				alignItems: 'start',
				flex: '0 0 auto'
			}
		})
	};
</script>

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
	<h1 class={styles.characterName}>{character.name}</h1>
	{@render toolbarActions?.()}
	<div class={styles.resources}>
		<GoldIndicator amount={characterState.gold} />
		<ExperienceIndicator amount={characterState.availableXp} />
	</div>
</Toolbar>

<div class={styles.content}>
	<div class={styles.details}>
		<section class="stats">
			<h1 class={styles.sectionTitle}>
				<Text ca="Característiques" es="Características" en="Stats" />
			</h1>
			<div class={styles.statsSheet}>
				<StatsSheet stats={baseStats} statTypes={attributeTypes} showLabels={true} />
				<StatsSheet stats={baseStats} statTypes={indicatorTypes} showLabels={true} />
			</div>
		</section>
		<section class={styles.focuses}>
			<h1 class={styles.sectionTitle}>
				<Text ca="Bossa de focus" es="Bolsa de focos" en="Focuses bag" />
			</h1>
			<div class="focuses-list">
				<FocusBag focuses={characterState.getFocusTokens()} />
			</div>
		</section>
	</div>
	<div class={cardSetsLayoutStyles[cardSetsLayout].cardSets}>
		<div class={styles.cardColumn}>
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
		<div class={styles.cardColumn}>
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
		<div class={styles.cardColumn}>
			{@render cardSet(
				{ ca: 'Habilitats', es: 'Habilidades', en: 'Skills' },
				characterState.skills(),
				'skill',
				characterState.skillDeckSize
			)}
		</div>
	</div>
	{#if catalog}
		<section class={styles.catalog}>
			<h1 class={styles.sectionTitle}>
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
	<section data-type={entityTypeId}>
		<div class={styles.cardSetHeader}>
			<h1 class={styles.cardSetTitle}><Text {...title} /></h1>
			<span class={styles.cardSetSize}>
				{sumCopiesOfEntities(entities)}
				{#if expectedSize !== undefined}
					/ {expectedSize}
				{/if}
			</span>
			{#if onFilterClick}
				<IconButton
					class={styles.cardSetFilterButton}
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
