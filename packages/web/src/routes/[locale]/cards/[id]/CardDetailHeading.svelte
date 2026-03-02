<script lang="ts" module>
	const getSetIcon = (entity: Entity) => {
		if (entity.set instanceof Archetype) {
			return `archetypes/${entity.set.id}.svg`;
		} else if (entity.set instanceof Discipline) {
			return `disciplines/${entity.set.id}.svg`;
		} else if (entity.set instanceof Module) {
			return `modules/${entity.set.id}.svg`;
		}
		return undefined;
	};
</script>

<script lang="ts">
	import { page } from '$app/state';
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import CardLevel from '$lib/components/entities/CardLevel.svelte';
	import type { Entity } from '@songsofdoom/game';
	import { Archetype, Discipline, Module } from '@songsofdoom/game';
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
