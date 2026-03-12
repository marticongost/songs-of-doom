<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		cardPage: {
			'&:not([data-entity-type="module"]):not([data-entity-type="discipline"]):not([data-entity-type="campaign"])':
				{
					...css.row('xl'),
					alignItems: 'flex-start'
				}
		},
		cardSet: {
			'& + &': {
				marginTop: css.spacing.lg
			}
		},
		cardSetGrid: {
			width: '20em',
			...css.column('sm'),
			alignItems: 'stretch'
		},
		cardSetTitle: {
			fontFamily: css.fonts.heading,
			fontSize: '1.2em',
			marginBottom: css.spacing.sm
		}
	});
</script>

<script lang="ts">
	import Card from '$lib/components/entities/Card.svelte';
	import CardButton from '$lib/components/entities/CardButton.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import { type LocalisedText } from '@songsofdoom/common/localisation';
	import {
		Archetype,
		Campaign,
		Discipline,
		Entity,
		entityTypes,
		Module,
		Scenario
	} from '@songsofdoom/game';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

{#snippet cardSet(title: LocalisedText, entities: Array<Entity>)}
	<section class={styles.cardSet}>
		<h1 class={styles.cardSetTitle}><Text {...title} /></h1>
		{#if entities.length === 0}
			<p><Text ca="Cap." es="Nada" en="None" /></p>
		{:else}
			<div class={styles.cardSetGrid}>
				{#each entities as entity (entity.variantId)}
					<CardButton {entity} />
				{/each}
			</div>
		{/if}
	</section>
{/snippet}

<div class={styles.cardPage} data-entity-type={data.entity.type.id}>
	{#if data.entity instanceof Campaign}
		{@render cardSet(
			{ ca: 'Escenaris', es: 'Escenarios', en: 'Scenarios' },
			data.entity.getChildrenOfType(entityTypes.scenario)
		)}
		{@render cardSet(
			{ ca: 'Mòduls', es: 'Módulos', en: 'Modules' },
			data.entity.getChildrenOfType(entityTypes.module)
		)}
	{:else if data.entity instanceof Module}
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
			{#if data.entity instanceof Scenario}
				{@render cardSet(
					{ ca: 'Amenaces', es: 'Amenazas', en: 'Threats' },
					data.entity.getChildrenOfType(entityTypes.threat)
				)}
				{@render cardSet(
					{ ca: 'Missions', es: 'Misiones', en: 'Missions' },
					data.entity.getChildrenOfType(entityTypes.mission)
				)}
				{@render cardSet(
					{ ca: 'Encontres', es: 'Encuentros', en: 'Encounters' },
					data.entity.getChildrenOfType(entityTypes.encounter)
				)}
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
