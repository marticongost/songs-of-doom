<script lang="ts">
	import { page } from '$app/state';
	import type { KeyboardNavigation } from '$lib/attachments/keyboard-nav';
	import type { Entity } from '$lib/catalog/models/entity';
	import Card from '$lib/components/Card.svelte';
	import { translate, type Locale } from '$lib/localisation';
	import type { GroupingResult } from '$lib/sorting';
	import type { Component } from 'svelte';
	import { standardAttributes, type StandardAttributeProps } from './standardattributes';

	interface BaseProps extends StandardAttributeProps {
		EntityComponent?: Component<{ entity: Entity }>;
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
		keyboardNav,
		...attributes
	}: Props = $props();

	const locale = $derived(page.params.locale as Locale);
</script>

<div
	{...standardAttributes(attributes, 'entity-grid')}
	class:grid={!groupedEntities}
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
				<div class="grid">
					{#each groupEntities as entity (entity.variantId)}
						<EntityComponent {entity} />
					{/each}
				</div>
			</section>
		{/each}
	{:else if entities && entities.length > 0}
		{#each entities as entity (entity.variantId)}
			<EntityComponent {entity} />
		{/each}
	{/if}
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.grid {
		@include rz.grid(lg);
	}

	.groups {
		@include rz.column(xl);
	}

	.group {
		@include rz.column(md);
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
