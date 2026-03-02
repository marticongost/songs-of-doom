<script lang="ts">
	import Card from '$lib/components/entities/Card.svelte';
	import CardButton from '$lib/components/entities/CardButton.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import { type LocalisedText } from '@songsofdoom/common/localisation';
	import { Archetype, Discipline, Entity, entityTypes, Module } from '@songsofdoom/game';
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

<div
	class="card-page"
	class:module={data.entity instanceof Module}
	class:discipline={data.entity instanceof Discipline}
>
	{#if data.entity instanceof Module}
		{@render cardSet(
			{ ca: 'Encontres', es: 'Encuentros', en: 'Encounters' },
			data.entity.getChildrenOfType(entityTypes.encounter)
		)}
		{@render cardSet(
			{ ca: 'Criatures', es: 'Criaturas', en: 'Creatures' },
			data.entity.getChildrenOfType(entityTypes.creature)
		)}
	{:else if data.entity instanceof Discipline}
		{@const discipline = data.entity as Discipline}
		{@render cardSet(
			{
				ca: 'Arquetips que la desbloquegen',
				es: 'Arquetipos que la desbloquean',
				en: 'Unlocking archetypes'
			},
			discipline.unlockingArchetypes
		)}
		{@render cardSet(
			{ ca: 'Trets', es: 'Rasgos', en: 'Traits' },
			discipline.getChildrenOfType(entityTypes.trait)
		)}
		{@render cardSet(
			{ ca: 'Habilitats', es: 'Habilidades', en: 'Skills' },
			discipline.getChildrenOfType(entityTypes.skill)
		)}
	{:else}
		<Card entity={data.entity} linked={false} />

		<aside>
			{#if data.entity.set && data.entity.set !== data.entity && data.entity.set instanceof Module}
				{@render cardSet({ ca: 'Mòdul', es: 'Módulo', en: 'Module' }, [data.entity.set])}
			{/if}
			{#if data.entity.requiredDiscipline}
				{@const disc = data.entity.requiredDiscipline}
				{@render cardSet({ ca: 'Disciplina', es: 'Disciplina', en: 'Discipline' }, [disc])}
			{/if}
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
					{ ca: 'Disciplines', es: 'Disciplinas', en: 'Disciplines' },
					archetype.disciplines
				)}
				{@render cardSet(
					{ ca: 'Trets exclusius', es: 'Rasgos exclusivos', en: 'Exclusive traits' },
					archetype.getChildrenOfType(entityTypes.trait)
				)}
				{@render cardSet(
					{ ca: 'Habilitats exclusives', es: 'Habilidades exclusivas', en: 'Exclusive skills' },
					archetype.getChildrenOfType(entityTypes.skill)
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

	.card-page:not(.module):not(.discipline) {
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
