<script lang="ts">
	import { Entity } from '$lib/catalog/models/entity';
	import type { CardType } from '$lib/catalog/models/properties';
	import { Trait } from '$lib/catalog/models/trait';
	import Card from '$lib/components/Card.svelte';
	import CardButton from '$lib/components/CardButton.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import { type LocalisedText } from '$lib/localisation';
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
				{#each entities as entity}
					<CardButton {entity} />
				{/each}
			</div>
		{/if}
	</section>
{/snippet}

<div class="card-page">
	<Card entity={data.entity} />

	<aside>
		{#if data.entity.isArchetype}
			{@const archetype = data.entity as Trait}
			{@render cardSet(
				{ ca: 'Subarquetips', es: 'Subarquetipo', en: 'Subarchetypes' },
				archetype.getChildrenOfType('archetype')
			)}
			{@render cardSet(
				{ ca: 'Trets', es: 'Rasgos', en: 'Traits' },
				archetype.getChildrenOfType('trait')
			)}
			{@render cardSet(
				{ ca: 'Habilitats', es: 'Habilidades', en: 'Skills' },
				archetype.getChildrenOfType('skill')
			)}
			{@render cardSet(
				{ ca: 'Aliats', es: 'Aliados', en: 'Allies' },
				archetype.getChildrenOfType('ally')
			)}
		{/if}
	</aside>
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.card-page {
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
