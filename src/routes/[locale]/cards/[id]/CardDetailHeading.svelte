<script lang="ts" module>
	const getSetIcon = (entity: Entity) => {
		if (entity.set instanceof Archetype) {
			return `archetypes/${entity.set.id}.svg`;
		} else if (entity.set instanceof Module) {
			return `modules/${entity.set.id}.svg`;
		}
		return undefined;
	};
</script>

<script lang="ts">
	import { page } from '$app/state';
	import { Archetype } from '$lib/catalog/models/archetype';
	import type { Entity } from '$lib/catalog/models/entity';
	import { Module } from '$lib/catalog/models/module';
	import CardLevel from '$lib/components/CardLevel.svelte';
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	const setIcon = $derived(getSetIcon(page.data.entity as Entity));
</script>

<div class="card-detail-heading">
	{#if setIcon}
		<InlineSvg src={setIcon} class="set-icon" />
	{/if}
	<h1 class="page-title">{page.data.title}</h1>
	<CardLevel entity={page.data.entity as Entity} />
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;
	.card-detail-heading {
		@include rz.row(md);

		:global(.set-icon) {
			font-size: 2.5em;
			color: var(--text-subtle-color);
		}
	}
</style>
