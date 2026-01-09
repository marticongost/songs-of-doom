<script lang="ts">
	import type { Entity } from '$lib/catalog/models/entity';
	import CapabilityList from '$lib/components/capabilities/CapabilityList.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import { standardAttributes } from '$lib/components/standardattributes';
	import ChargesChip from './capabilities/ChargesChip.svelte';
	import InlineSvg from './InlineSvg.svelte';
	import PropertyList from '$lib/components/properties/PropertyList.svelte';
	import Image from './Image.svelte';
	export let entity: Entity;
</script>

<article {...standardAttributes($$props, 'card')}>
	<div class="header">
		{#if entity.isArchetype}
			<InlineSvg class="own-archetype-icon" src="archetypes/{entity.id}.svg" />
		{/if}
		<div class="title">
			<h1><Text {...entity.title} /></h1>
			{#if entity.maxCharges}
				<ChargesChip charges={entity.maxCharges} />
			{/if}
		</div>
		{#if entity.archetype}
			<InlineSvg class="required-archetype-icon" src="archetypes/{entity.archetype.id}.svg" />
		{/if}
	</div>
	<Image src="cards/{entity.id}.jpg" />
	<PropertyList properties={entity.properties} />
	<div class="description">{entity.description}</div>
	<CapabilityList capabilities={entity.capabilities} />
</article>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.header {
		@include rz.row(sm);

		:global(.own-archetype-icon) {
			flex: 0 0 auto;
			height: 1.8rem;
		}

		:global(.required-archetype-icon) {
			flex: 0 0 auto;
			height: 1.5rem;
			color: var(--text-subtle-color);
		}
	}

	.card {
		@include rz.column(sm);
		align-items: stretch;
		width: 30rem;
		padding: 1rem;
		border: var(--panel-border);
		border-radius: 0.5rem;
		background-color: var(--panel-background-color);
	}

	.title {
		@include rz.row(sm);
		margin-right: auto;
	}

	h1 {
		font-family: var(--heading-font);
		font-size: 1.4rem;
		color: var(--text-heading-color);
	}
</style>
