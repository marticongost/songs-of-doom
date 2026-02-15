<script lang="ts">
	import { Archetype } from '@songsofdoom/game';
	import { Entity } from '@songsofdoom/game';
	import { Module } from '@songsofdoom/game';
	import { entityTypes } from '@songsofdoom/game';
	import Card from '$lib/components/Card.svelte';
	import CardButton from '$lib/components/CardButton.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import { type LocalisedText } from '@songsofdoom/common/localisation';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

{#snippet cardSet(title: LocalisedText, entities: Array<Entity>)}
	<section class="card-set">
		<h1 class="card-set-title"><Text {...title} /></h1>
		{#if entities.length === 0}
			<p><Text ca="Cap." es="Nada" en="None" /></p>
		{:else}
			<div class="card-set-grid">
				{#each entities as entity (entity.variantId)}
					<CardButton {entity} />
				{/each}
			</div>
		{/if}
	</section>
{/snippet}

<div class="card-page" class:module={data.entity instanceof Module}>
	{#if data.entity instanceof Module}
		{@render cardSet(
			{ ca: 'Encontres', es: 'Encuentros', en: 'Encounters' },
			data.entity.getChildrenOfType(entityTypes.encounter)
		)}
		{@render cardSet(
			{ ca: 'Criatures', es: 'Criaturas', en: 'Creatures' },
			data.entity.getChildrenOfType(entityTypes.creature)
		)}
	{:else}
		<Card entity={data.entity} linked={false} />

		<aside>
			{#if data.entity.requiredArchetype}
				{@render cardSet({ ca: 'Arquetip', es: 'Arquetipo', en: 'Archetype' }, [
					data.entity.requiredArchetype
				])}
			{/if}
			{#if data.entity instanceof Archetype}
				{@const archetype = data.entity as Archetype}
				{@render cardSet(
					{ ca: 'Subarquetips', es: 'Subarquetipo', en: 'Subarchetypes' },
					archetype.getChildrenOfType(entityTypes.archetype)
				)}
				{@render cardSet(
					{ ca: 'Trets', es: 'Rasgos', en: 'Traits' },
					archetype.getChildrenOfType(entityTypes.trait)
				)}
				{@render cardSet(
					{ ca: 'Habilitats', es: 'Habilidades', en: 'Skills' },
					archetype.getChildrenOfType(entityTypes.skill)
				)}
				{@render cardSet(
					{ ca: 'Aliats', es: 'Aliados', en: 'Allies' },
					archetype.getChildrenOfType(entityTypes.ally)
				)}
			{/if}
			{#if data.entity.variants.length > 1}
				{@render cardSet(
					{ ca: 'Altres variants', es: 'Otras variantes', en: 'Other variants' },
					data.entity.variants.filter((e) => e.variantId !== data.entity.variantId)
				)}
			{/if}
		</aside>
	{/if}
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.card-page:not(.module) {
		@include rz.row(xl);
		align-items: flex-start;
	}

	.card-set {
		& + & {
			margin-top: rz.size(lg);
		}
	}

	.card-set-grid {
		width: 20em;
		@include rz.column(sm);
		align-items: stretch;
	}

	.card-set-title {
		font-family: var(--heading-font);
		font-size: 1.2em;
		margin-bottom: rz.size(sm);
	}
</style>
