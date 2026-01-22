<script lang="ts">
	import { aptitudeTypes } from '$lib/catalog/models/aptitude';
	import { Creature } from '$lib/catalog/models/creature';
	import type { Entity } from '$lib/catalog/models/entity';
	import { Item } from '$lib/catalog/models/inventory';
	import { Skill } from '$lib/catalog/models/skill';
	import AptitudeIcon from '$lib/components/aptitudes/AptitudeIcon.svelte';
	import CapabilityList from '$lib/components/capabilities/CapabilityList.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import PropertyList from '$lib/components/properties/PropertyList.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { getLocale } from '$lib/context/locale';
	import ChargesChip from './capabilities/ChargesChip.svelte';
	import CreatureStats from './CreatureStats.svelte';
	import ExperienceChip from './ExperienceChip.svelte';
	import Image from './Image.svelte';
	import InlineSvg from './InlineSvg.svelte';

	interface Props extends StandardAttributeProps {
		entity: Entity;
		linked?: boolean;
	}

	const { entity, linked = true, ...rest }: Props = $props();

	const archetype = $derived(entity.isArchetype ? entity : entity.archetype);
	const discardReward = $derived(entity instanceof Skill ? entity.discardReward : undefined);
</script>

<svelte:element
	this={linked ? 'a' : 'div'}
	href={linked ? `/${getLocale()}/cards/${entity.id}` : undefined}
	{...standardAttributes(rest, 'card')}
	data-type={entity.type}
>
	<div class="header">
		{#if archetype}
			<div class="archetype-frame">
				<InlineSvg class="archetype-icon" src="archetypes/{archetype.id}.svg" />
			</div>
		{/if}
		<div class="title"><Text {...entity.title} /></div>
		<div class="acquisition">
			{#if entity.archetype}
				<div class="required-archetype">
					<Text {...entity.archetype.title} />
				</div>
			{/if}
			{#if entity.xpCost !== undefined}
				<ExperienceChip
					amount={entity.xpCost}
					style="font-size: 1.3em; margin-left: auto; align-self: center"
				/>
			{/if}
		</div>
	</div>
	<div class="image-row">
		{#if entity instanceof Creature}
			<CreatureStats stats={entity.stats} />
		{/if}
		<Image class="image" src="cards/{entity.id}.jpg" />
		{#if discardReward && !discardReward.empty()}
			<div class="discard-reward">
				{#each aptitudeTypes as aptitude}
					{#each { length: discardReward.get(aptitude) } as _}
						<AptitudeIcon {aptitude} />
					{/each}
				{/each}
			</div>
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
		<div class="description">{entity.description}</div>
		<CapabilityList capabilities={entity.capabilities} />
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

		@each $type in archetype, trait, skill, ally, item, creature {
			&[data-type='#{$type}'] {
				--main-background: var(--card-type-#{$type}-main-background);
				--secondary-background: var(--card-type-#{$type}-secondary-background);
			}
		}

		@media print {
			font-size: #{$card-content-scale}mm;
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

	.discard-reward {
		@include rz.column(xs);
		position: absolute;
		top: rz.size(sm);
		left: rz.size(sm);
		font-size: 1.4em;
		box-shadow: 0 0 1em rgba(black, 0.5);
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

	.archetype-frame {
		background-color: rgba(black, 0.2);
		border-right: 1px solid rgba(black, 0.1);
		width: 3em;
		height: 100%;
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		justify-content: center;

		:global(.archetype-icon) {
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

	.details {
		@include rz.row(sm);
		@include rz.padding(sm);
		border-top: var(--panel-separator);
		border-bottom: var(--panel-separator);
		background-image: var(--secondary-background);
	}

	.body {
		@include rz.column(sm);
		@include rz.padding(sm);
	}
</style>
