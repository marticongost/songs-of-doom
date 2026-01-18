<script lang="ts">
	import type { Entity } from '$lib/catalog/models/entity';
	import Card from '$lib/components/Card.svelte';
	import type { Component } from 'svelte';
	import { standardAttributes, type StandardAttributeProps } from './standardattributes';

	interface Props extends StandardAttributeProps {
		entities: Entity[];
		EntityComponent?: Component<{ entity: Entity }>;
	}

	const { entities, EntityComponent = Card, ...attributes }: Props = $props();
</script>

{#if entities.length > 0}
	<div {...standardAttributes(attributes, 'entity-grid')}>
		{#each entities as entity}
			<EntityComponent {entity} />
		{/each}
	</div>
{/if}

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.entity-grid {
		@include rz.grid(lg);
	}
</style>
