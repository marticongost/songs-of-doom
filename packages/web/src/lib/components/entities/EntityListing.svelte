<script lang="ts">
	import { page } from '$app/state';
	import type { KeyboardNavigation } from '$lib/attachments/keyboard-nav';
	import type { GroupingResult } from '$lib/sorting';
	import { translate, type Locale } from '@songsofdoom/common/localisation';
	import { type Entity } from '@songsofdoom/game';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import Card from './Card.svelte';
	import CardButton from './CardButton.svelte';
	import EntityCarousel, { type EntityCarouselApi } from './EntityCarousel.svelte';
	import type { EntityManager } from './entitymanager';

	interface BaseProps extends StandardAttributeProps {
		/** The appearance of the entity listing */
		appearance?: 'card-grid' | 'button-columns';

		/** Optional keyboard navigation handler */
		keyboardNav?: KeyboardNavigation;

		/** Optional entity manager - enables carousel when provided */
		entityManager?: EntityManager;

		/** Whether to visually dim unavailable entities. */
		dimUnavailableEntities?: boolean;
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
		dimUnavailableEntities = false,
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
		if (!entityManager) return undefined;
		return () => openCarousel(entity, flatIndex);
	}
</script>

{#snippet renderCard(entity: Entity, _flatIndex: number)}
	<Card
		{entity}
		{entityManager}
		linked={!entityManager}
		dimmed={dimUnavailableEntities && !!entityManager?.getAcquisitionImpediment(entity)}
	/>
{/snippet}

{#snippet renderCardButton(entity: Entity, flatIndex: number)}
	<CardButton
		{entity}
		{entityManager}
		onclick={createEntityClickHandler(entity, flatIndex)}
		dimmed={dimUnavailableEntities && !!entityManager?.getAcquisitionImpediment(entity)}
	/>
{/snippet}

<div
	{...standardAttributes(attributes, 'entity-listing')}
	class:flat-grid={!groupedEntities && appearance === 'card-grid'}
	class:groups={groupedEntities}
	{@attach keyboardNav?.resultsAttachment()}
>
	{#if groupedEntities}
		{#each groupedEntities as { group, entities: groupEntities }, groupIndex (group.id)}
			{@const groupStartIndex = getGroupStartIndex(groupIndex)}
			<section class="group">
				<h2 class="group-heading">
					{translate(group.title, locale)}
					<span class="group-count">({groupEntities.length})</span>
				</h2>
				{#if appearance === 'button-columns'}
					<div class="entities columns">
						{#each groupEntities as entity, i (entity.variantId)}
							<div class="entity">
								{@render renderEntity(entity, groupStartIndex + i)}
							</div>
						{/each}
					</div>
				{:else}
					<div class="entities grid">
						{#each groupEntities as entity, i (entity.variantId)}
							{@render renderEntity(entity, groupStartIndex + i)}
						{/each}
					</div>
				{/if}
			</section>
		{/each}
	{:else if entities && entities.length > 0}
		{#if appearance === 'button-columns'}
			<div class="entities columns">
				{#each entities as entity, i (entity.variantId)}
					<div class="entity">
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

{#if carouselAwareEntityManager}
	<EntityCarousel
		bind:this={carouselRef}
		entities={carouselEntities}
		entityManager={carouselAwareEntityManager}
		{dimUnavailableEntities}
	/>
{/if}

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.flat-grid {
		@include rz.grid(lg);
	}

	.groups {
		@include rz.column(xl);
	}

	.entities.grid {
		@include rz.grid(lg);
	}

	.group {
		@include rz.column(md);
	}

	.entities.columns {
		column-gap: rz.size(md);
		column-width: 20em;

		.entity + .entity {
			margin-top: rz.size(md);
		}
	}

	.entity {
		break-inside: avoid;
		-webkit-column-break-inside: avoid;
	}

	.group-heading {
		font-family: var(--heading-font);
		font-size: 1.5em;
		color: var(--text-heading-color);
		display: flex;
		align-items: baseline;
		gap: rz.size(sm);
	}

	.group-count {
		font-size: 0.6em;
		color: var(--text-subtle-color);
	}
</style>
