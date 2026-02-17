<script lang="ts">
	import { resolve } from '$app/paths';
	import { getLocale } from '$lib/context/locale';
	import type { Entity } from '@songsofdoom/game';
	import Button from './Button.svelte';
	import Card from './Card.svelte';
	import CardLevel from './CardLevel.svelte';
	import ExperienceIndicator from './indicators/ExperienceIndicator.svelte';
	import Text from './localisation/Text.svelte';
	import Popover from './Popover.svelte';
	import { standardAttributes, type StandardAttributeProps } from './standardattributes';

	interface Props extends StandardAttributeProps {
		entity: Entity;
	}

	const { entity, ...attributes }: Props = $props();

	const popoverId = $derived(`card-popover-${entity.variantId}`);
	const anchorName = $derived(`--${popoverId}`);
	const cardHref = $derived(
		resolve('/[locale]/cards/[id]', { locale: getLocale(), id: entity.variantId })
	);
</script>

<div {...standardAttributes(attributes, 'card-button-wrapper')}>
	<button
		class="card-button"
		data-type={entity.type.id}
		popovertarget={popoverId}
		style:anchor-name={anchorName}
	>
		<div class="title"><Text {...entity.title} /></div>
		<CardLevel {entity} />
		{#if entity.xpCost !== undefined}
			<ExperienceIndicator amount={entity.xpCost} />
		{/if}
	</button>
	<Popover id={popoverId} anchor={anchorName} position="right">
		<div class="popover-content">
			<Card {entity} linked={false} />
			<Button href={cardHref}>
				<Text ca="Obrir" es="Abrir" en="Open" />
			</Button>
		</div>
	</Popover>
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.card-button-wrapper {
		display: contents;
	}

	.card-button {
		@include rz.row(sm);
		@include rz.vpadding(sm);
		@include rz.hpadding(md);
		width: 20em;
		border: var(--panel-border);
		border-radius: rz.size(sm);
		cursor: pointer;
		font-family: inherit;
		font-size: inherit;
		text-align: left;

		@each $type in archetype, trait, skill, ally, item, creature, encounter {
			&[data-type='#{$type}'] {
				background-image: var(--card-type-#{$type}-main-background);
			}
		}

		&:hover {
			border-color: var(--text-highlight);
		}
	}

	.title {
		font-family: var(--heading-font);
		font-weight: bold;
		color: var(--text-heading-color);
		text-shadow: 0 0 0.5em rgba(0, 0, 0, 0.8);
		margin-right: auto;
	}

	.popover-content {
		@include rz.column(md);
		align-items: center;
	}
</style>
