<script lang="ts">
	import { page } from '$app/state';
	import type { KeyboardNavigation } from '$lib/attachments/keyboard-nav';
	import Card from '$lib/components/Card.svelte';
	import type { GroupingResult } from '$lib/sorting';
	import { translate, type Locale } from '@songsofdoom/common/localisation';
	import type { Entity } from '@songsofdoom/game';
	import type { Component } from 'svelte';
	import { standardAttributes, type StandardAttributeProps } from './standardattributes';

	interface BaseProps extends StandardAttributeProps {
		EntityComponent?: Component<{ entity: Entity }>;
		appearance?: 'grid' | 'columns';
		/** Optional keyboard navigation handler */
		keyboardNav?: KeyboardNavigation;
	}

	type Props = BaseProps &
		(
			| { entities: Entity[]; groupedEntities?: never }
			| { groupedEntities: GroupingResult[]; entities?: never }
		);

	const {
		entities,
		groupedEntities,
		EntityComponent = Card,
		appearance = 'grid',
		keyboardNav,
		...attributes
	}: Props = $props();

	const locale = $derived(page.params.locale as Locale);
</script>

<div
	{...standardAttributes(attributes, 'entity-listing')}
	class:flat-grid={!groupedEntities && appearance === 'grid'}
	class:groups={groupedEntities}
	{@attach keyboardNav?.resultsAttachment()}
>
	{#if groupedEntities}
		{#each groupedEntities as { group, entities: groupEntities } (group.id)}
			<section class="group">
				<h2 class="group-heading">
					{translate(group.title, locale)}
					<span class="group-count">({groupEntities.length})</span>
				</h2>
				{#if appearance === 'columns'}
					<div class="entities columns">
						{#each groupEntities as entity (entity.variantId)}
							<div class="entity">
								<EntityComponent {entity} />
							</div>
						{/each}
					</div>
				{:else}
					<div class="entities grid">
						{#each groupEntities as entity (entity.variantId)}
							<EntityComponent {entity} />
						{/each}
					</div>
				{/if}
			</section>
		{/each}
	{:else if entities && entities.length > 0}
		{#if appearance === 'columns'}
			<div class="entities columns">
				{#each entities as entity (entity.variantId)}
					<div class="entity">
						<EntityComponent {entity} />
					</div>
				{/each}
			</div>
		{:else}
			{#each entities as entity (entity.variantId)}
				<EntityComponent {entity} />
			{/each}
		{/if}
	{/if}
</div>

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
