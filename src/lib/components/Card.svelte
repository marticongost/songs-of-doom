<script lang="ts" module>
	const getSetIcon = (set: Archetype | Module): string => {
		if (set instanceof Archetype) {
			return `archetypes/${set.id}.svg`;
		} else {
			return `modules/${set.id}.svg`;
		}
	};
</script>

<script lang="ts">
	import { Ally } from '$lib/catalog/models/ally';
	import { Archetype } from '$lib/catalog/models/archetype';
	import { Creature } from '$lib/catalog/models/creature';
	import type { Entity } from '$lib/catalog/models/entity';
	import { Item } from '$lib/catalog/models/inventory';
	import type { Module } from '$lib/catalog/models/module';
	import { Skill } from '$lib/catalog/models/skill';
	import CapabilityList from '$lib/components/capabilities/CapabilityList.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import PropertyList from '$lib/components/properties/PropertyList.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { getLocale } from '$lib/context/locale';
	import AttributesSheet from './AttributesSheet.svelte';
	import CapabilityCostList from './capabilities/CapabilityCostList.svelte';
	import ChargesChip from './capabilities/ChargesChip.svelte';
	import CardLevel from './CardLevel.svelte';
	import Image from './Image.svelte';
	import ExperienceIndicator from './indicators/ExperienceIndicator.svelte';
	import GoldIndicator from './indicators/GoldIndicator.svelte';
	import HealthIndicator from './indicators/HealthIndicator.svelte';
	import SanityIndicator from './indicators/SanityIndicator.svelte';
	import InlineSvg from './InlineSvg.svelte';

	interface Props extends StandardAttributeProps {
		entity: Entity;
		linked?: boolean;
	}

	const { entity, linked = true, ...rest }: Props = $props();
	const discardReward = $derived(entity instanceof Skill ? entity.discardReward : undefined);
</script>

<svelte:element
	this={linked ? 'a' : 'div'}
	href={linked ? `/${getLocale()}/cards/${entity.variantId}` : undefined}
	{...standardAttributes(rest, 'card')}
	data-type={entity.type.id}
>
	<div class="header">
		{#if entity.set}
			<div class="set-frame">
				<InlineSvg class="set-icon" src={getSetIcon(entity.set)} />
			</div>
		{/if}
		<div class="title"><Text {...entity.title} /></div>
		<CardLevel {entity} />
		<div class="acquisition">
			{#if entity.requiredArchetype}
				<div class="required-archetype">
					<Text {...entity.requiredArchetype.title} />
				</div>
			{/if}
			{#if entity.xpCost !== undefined}
				<ExperienceIndicator amount={entity.xpCost} style="font-size: 1.1em; align-self: center" />
			{/if}
			{#if entity.goldCost !== undefined}
				<GoldIndicator amount={entity.goldCost} style="font-size: 1.1em; align-self: center" />
			{/if}
		</div>
	</div>
	<div class="image-row">
		{#if entity instanceof Creature || entity instanceof Ally}
			<AttributesSheet attributes={entity.stats} />
			<div class="indicators">
				<HealthIndicator amount={entity.stats.health} contrast={true} />
				{#if entity instanceof Ally}
					<SanityIndicator amount={entity.stats.sanity} contrast={true} />
				{/if}
			</div>
		{/if}
		<Image class="image" src="cards/{entity.id}.jpg" />
		{#if discardReward && !discardReward.empty()}
			<CapabilityCostList class="discard-reward" cost={discardReward} layout="column" />
		{/if}
	</div>
	<div class="details">
		<PropertyList style="margin-right: auto" properties={entity.properties} />
		{#if entity.maxCharges}
			<ChargesChip charges={entity.maxCharges} />
		{/if}
		{#if entity instanceof Item && entity.slot}
			<InlineSvg class="slot" src="slots/{entity.slot.type}.svg" />
		{/if}
	</div>
	<div class="body">
		{#if entity.description}
			<div class="description">{entity.description}</div>
		{/if}
		<CapabilityList class="capabilities" capabilities={entity.capabilities} />
		{#if entity.attachmentCapabilities.length > 0}
			<div class="attachment">
				<div class="attachment-title">
					<Text ca="Mentre estigui vinculada" es="Mientras esté vinculada" en="While attached" />
				</div>
				<CapabilityList capabilities={entity.attachmentCapabilities} />
			</div>
		{/if}
	</div>
</svelte:element>

<style lang="scss">
	@use 'sass:math';
	@use '@reguitzell/styles' as rz;

	$card-print-width: 64;
	$card-print-height: 89;
	$card-screen-width: 24;
	$card-content-scale: 2.3;
	$header-padding: sm;

	.card {
		@include rz.column;
		align-items: stretch;
		border: var(--panel-border);
		border-radius: 0.5em;
		background-color: var(--panel-background-color);
		font-size: #{math.div($card-screen-width, $card-print-width) * $card-content-scale}em;
		width: #{math.div($card-print-width, $card-content-scale)}em;
		height: #{math.div($card-print-height, $card-content-scale)}em;
		overflow: hidden;

		@each $type in archetype, trait, skill, ally, item, creature, encounter {
			&[data-type='#{$type}'] {
				--main-background: var(--card-type-#{$type}-main-background);
				--secondary-background: var(--card-type-#{$type}-secondary-background);
			}
		}

		@media print {
			font-size: #{$card-content-scale}mm;
		}

		:global(.discard-reward) {
			position: absolute;
			top: rz.size(sm);
			left: rz.size(sm);
			font-size: 1.4em;
			box-shadow: 0 0 1em rgba(black, 0.5);
		}
	}

	a.card:hover {
		border-color: var(--text-highlight);
	}

	.image-row {
		@include rz.row;
		align-items: stretch;
		position: relative;
	}

	:global(.card .image) {
		flex: 1;
		min-width: 0;
		height: #{math.div($card-print-width, $card-content-scale) * math.div(9, 16)}em;
		object-fit: cover;
		object-position: center;
	}

	.header {
		@include rz.row;
		border-bottom: var(--panel-separator);
		background-image: var(--main-background);
	}

	.title {
		@include rz.padding($header-padding);
		font-family: var(--heading-font);
		font-size: 1.4em;
		font-weight: bold;
		color: var(--text-heading-color);
		text-shadow: 0 0 0.5em rgba(0, 0, 0, 0.8);
	}

	.set-frame {
		background-color: rgba(black, 0.2);
		border-right: 1px solid rgba(black, 0.1);
		width: 3em;
		height: 100%;
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		justify-content: center;

		:global(.set-icon) {
			height: 2.1em;
			filter: drop-shadow(0 0 0.8rem black);
			color: rgba(white, 0.7);
		}
	}

	.acquisition {
		@include rz.row(sm);
		@include rz.padding($header-padding);
		margin-left: auto;
	}

	.required-archetype {
		font-size: 0.9em;
		opacity: 0.7;
	}

	.indicators {
		@include rz.row(xs);
		position: absolute;
		bottom: rz.size(xs);
		right: rz.size(xs);
		font-size: 1.5em;
	}

	.details {
		@include rz.row(sm);
		@include rz.padding(sm);
		border-top: var(--panel-separator);
		border-bottom: var(--panel-separator);
		background-image: var(--secondary-background);
	}

	.body {
		@include rz.column(sm);
		flex: 1 1 auto;

		:global(.capabilities) {
			@include rz.padding(sm);
			flex: 1 1 auto;
		}
	}

	.attachment {
		@include rz.padding(sm);
		background-color: rgba(black, 0.2);
		flex: 0 0 auto;
	}

	.attachment-title {
		font-weight: bold;
		font-family: var(--heading-font);
		color: var(--text-heading-color);
		margin-bottom: rz.size(sm);
	}
</style>
