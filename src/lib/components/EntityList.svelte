<script lang="ts">
	import type { Entity } from '$lib/catalog/models/entity';
	import Card from '$lib/components/Card.svelte';
	import type { Component } from 'svelte';
	import { standardAttributes } from './standardattributes';

	export let entities: Entity[];
	export let EntityComponent: Component<{ entity: Entity }> = Card;
</script>

{#if entities.length > 0}
	<div {...standardAttributes($$props, 'entity-list')}>
		{#each entities as entity}
			<svelte:component this={EntityComponent} {entity} />
		{/each}
	</div>
{/if}

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.entity-list {
		@include rz.column(md);
	}
</style>
