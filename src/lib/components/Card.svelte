<script lang="ts">
	import type { Entity } from '$lib/catalog/models/entity';
	import CapabilityList from '$lib/components/capabilities/CapabilityList.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import { standardAttributes } from '$lib/components/standardattributes';
	import ChargesChip from './capabilities/ChargesChip.svelte';
	import InlineSvg from './InlineSvg.svelte';
	import PropertyList from '$lib/components/properties/PropertyList.svelte';
	import Image from './Image.svelte';
	import { Item } from '$lib/catalog/models/inventory';
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
			{#if entity instanceof Item && entity.slot}
				<InlineSvg class="slot" src="slots/{entity.slot.type}.svg" />
			{/if}
		</div>
		{#if entity.archetype}
			<InlineSvg class="required-archetype-icon" src="archetypes/{entity.archetype.id}.svg" />
		{/if}
	</div>
	<Image class="image" src="cards/{entity.id}.jpg" />
	<div class="details">
		<PropertyList properties={entity.properties} />
	</div>
	<div class="body">
		<div class="description">{entity.description}</div>
		<CapabilityList capabilities={entity.capabilities} />
	</div>
</article>

<style lang="scss">
	@use 'sass:math';
	@use '@reguitzell/styles' as rz;

	$card-print-width: 64;
	$card-print-height: 89;
	$card-screen-width: 24;
	$card-content-scale: 2.3;

	.card {
		@include rz.column;
		align-items: stretch;
		border: var(--panel-border);
		border-radius: 0.5em;
		background-color: var(--panel-background-color);
		font-size: #{math.div($card-screen-width, $card-print-width) * $card-content-scale}em;
		width: #{math.div($card-print-width, $card-content-scale)}em;
		height: #{math.div($card-print-height, $card-content-scale)}em;

		@media print {
			font-size: #{$card-content-scale}mm;
		}
	}

	:global(.card .image) {
		height: #{math.div($card-print-width, $card-content-scale) * math.div(9, 16)}em;
		object-fit: cover;
	}

	.header {
		@include rz.row(sm);
		@include rz.padding(sm);
		border-bottom: var(--panel-separator);
		background-image: var(--panel-heading);

		:global(.own-archetype-icon) {
			flex: 0 0 auto;
			height: 1.8em;
		}

		:global(.required-archetype-icon) {
			flex: 0 0 auto;
			height: 1.5em;
			color: var(--text-subtle-color);
		}
	}

	.details {
		@include rz.row(sm);
		@include rz.padding(sm);
		border-top: var(--panel-separator);
		border-bottom: var(--panel-separator);
		background-image: var(--panel-subheading);
	}

	.body {
		@include rz.column(sm);
		@include rz.padding(sm);
	}

	.title {
		@include rz.row(sm);
		margin-right: auto;
	}

	:global(.card .title svg) {
		vertical-align: baseline;
	}

	h1 {
		font-family: var(--heading-font);
		font-size: 1.4em;
		color: var(--text-heading-color);
		text-shadow: 0 0 0.5em rgba(0, 0, 0, 0.8);
	}
</style>
