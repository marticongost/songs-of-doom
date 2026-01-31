<script lang="ts">
	import type { Entity } from '$lib/catalog/models/entity';
	import { resolve } from '$app/paths';
	import { getLocale } from '$lib/context/locale';
	import CardLevel from './CardLevel.svelte';
	import ExperienceChip from './ExperienceChip.svelte';
	import Text from './localisation/Text.svelte';
	import { standardAttributes, type StandardAttributeProps } from './standardattributes';

	interface Props extends StandardAttributeProps {
		entity: Entity;
	}

	const { entity, ...attributes }: Props = $props();
</script>

<a
	{...standardAttributes(attributes, 'card-button')}
	data-type={entity.type}
	href={resolve('/[locale]/cards/[id]', { locale: getLocale(), id: entity.variantId })}
>
	<div class="title"><Text {...entity.title} /></div>
	<CardLevel {entity} />
	<ExperienceChip amount={entity.xpCost ?? 0} />
</a>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.card-button {
		@include rz.row(sm);
		@include rz.vpadding(sm);
		@include rz.hpadding(md);
		border: var(--panel-border);
		border-radius: rz.size(sm);

		@each $type in archetype, trait, skill, ally, item, creature {
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
</style>
