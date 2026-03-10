<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		flatGrid: {
			...css.grid('lg')
		},
		groups: {
			...css.column('xl')
		},
		grid: {
			...css.grid('lg')
		},
		columns: {
			columnGap: css.spacing.md,
			columnWidth: '20em',
			'& > * + *': {
				marginTop: css.spacing.md
			}
		},
		group: {
			...css.column('md')
		},
		entity: {
			breakInside: 'avoid',
			WebkitColumnBreakInside: 'avoid'
		},
		groupHeading: {
			fontFamily: css.fonts.heading,
			fontSize: '1.5em',
			color: css.text.headingColor,
			display: 'flex',
			alignItems: 'baseline',
			gap: css.spacing.sm
		},
		groupCount: {
			fontSize: '0.6em',
			color: css.text.subtleColor
		}
	});
</script>

<script lang="ts">
	import { page } from '$app/state';
	import type { KeyboardNavigation } from '$lib/attachments/keyboard-nav';
	import type { GroupingResult } from '$lib/sorting';
	import { cx } from '@emotion/css';
	import { translate, type Locale } from '@songsofdoom/common/localisation';
	import { type Entity } from '@songsofdoom/game';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import Card from './Card.svelte';
	import CardButton from './CardButton.svelte';
	import { isLocked } from './common';
	import EntityCarousel, { type EntityCarouselApi } from './EntityCarousel.svelte';
	import type { EntityManager } from './entitymanager';

	interface BaseProps extends StandardAttributeProps {
		/** The appearance of the entity listing */
		appearance?: 'card-grid' | 'button-columns';

		/** Optional keyboard navigation handler */
		keyboardNav?: KeyboardNavigation;

		/** Optional entity manager - enables carousel with add/remove when provided */
		entityManager?: EntityManager;

		/** Whether to visually dim unavailable entities. */
		dimLocked?: boolean;

		/** Enables the carousel for viewing without add/remove options. Ignored when entityManager is provided. */
		viewOnly?: boolean;
	}

	type Props = BaseProps &
		(
			| { entities: Entity[]; groupedEntities?: never }
			| { groupedEntities: GroupingResult[]; entities?: never }
		);

	const {
		entities,
		groupedEntities,
		appearance = 'card-grid',
		keyboardNav,
		entityManager,
		dimLocked = false,
		viewOnly = false,
		...attributes
	}: Props = $props();

	const renderEntity = $derived(appearance === 'button-columns' ? renderCardButton : renderCard);

	let carouselRef: EntityCarouselApi | undefined = $state();

	// Flatten entities for carousel consumption
	const carouselEntities = $derived.by(() => {
		if (groupedEntities) {
			return groupedEntities.flatMap((g) => g.entities);
		}
		return entities ?? [];
	});

	function openCarousel(_entity: Entity, index: number): void {
		carouselRef?.open(index);
	}

	const locale = $derived(page.params.locale as Locale);
	const carouselAwareEntityManager = $derived(
		entityManager
			? {
					...entityManager,
					onEntityRemoved(entity: Entity) {
						if (entity === carouselRef?.getCurrentEntity()) {
							entityManager.onEntityRemoved(entity);
							if (entityManager.getNumberOfOwnedCopies(entity) === 0) {
								carouselRef?.close();
							}
						}
					}
				}
			: undefined
	);

	// Calculate cumulative index for grouped entities
	function getGroupStartIndex(groupIndex: number): number {
		if (!groupedEntities) return 0;
		let startIndex = 0;
		for (let i = 0; i < groupIndex; i++) {
			startIndex += groupedEntities[i].entities.length;
		}
		return startIndex;
	}

	// Create onclick handler for a specific entity/index
	function createEntityClickHandler(
		entity: Entity,
		flatIndex: number
	): ((e: MouseEvent) => void) | undefined {
		if (!entityManager && !viewOnly) return undefined;
		return () => openCarousel(entity, flatIndex);
	}
</script>

{#snippet renderCard(entity: Entity, _flatIndex: number)}
	<Card
		{entity}
		{entityManager}
		linked={!entityManager}
		dimmed={dimLocked && isLocked(entity, entityManager)}
	/>
{/snippet}

{#snippet renderCardButton(entity: Entity, flatIndex: number)}
	<CardButton
		{entity}
		{entityManager}
		onclick={createEntityClickHandler(entity, flatIndex)}
		dimmed={dimLocked && isLocked(entity, entityManager)}
	/>
{/snippet}

<div
	{...standardAttributes(
		attributes,
		cx({
			[styles.flatGrid]: !groupedEntities && appearance === 'card-grid',
			[styles.groups]: !!groupedEntities
		})
	)}
	{@attach keyboardNav?.resultsAttachment()}
>
	{#if groupedEntities}
		{#each groupedEntities as { group, entities: groupEntities }, groupIndex (group.id)}
			{@const groupStartIndex = getGroupStartIndex(groupIndex)}
			<section class={styles.group}>
				<h2 class={styles.groupHeading}>
					{translate(group.title, locale)}
					<span class={styles.groupCount}>({groupEntities.length})</span>
				</h2>
				{#if appearance === 'button-columns'}
					<div class={styles.columns}>
						{#each groupEntities as entity, i (entity.variantId)}
							<div class={styles.entity}>
								{@render renderEntity(entity, groupStartIndex + i)}
							</div>
						{/each}
					</div>
				{:else}
					<div class={styles.grid}>
						{#each groupEntities as entity, i (entity.variantId)}
							{@render renderEntity(entity, groupStartIndex + i)}
						{/each}
					</div>
				{/if}
			</section>
		{/each}
	{:else if entities && entities.length > 0}
		{#if appearance === 'button-columns'}
			<div class={styles.columns}>
				{#each entities as entity, i (entity.variantId)}
					<div class={styles.entity}>
						{@render renderEntity(entity, i)}
					</div>
				{/each}
			</div>
		{:else}
			{#each entities as entity, i (entity.variantId)}
				{@render renderEntity(entity, i)}
			{/each}
		{/if}
	{/if}
</div>

{#if carouselAwareEntityManager || viewOnly}
	<EntityCarousel
		bind:this={carouselRef}
		entities={carouselEntities}
		entityManager={carouselAwareEntityManager}
		{dimLocked}
	/>
{/if}
