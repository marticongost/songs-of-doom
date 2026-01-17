<script lang="ts">
	import type { Entity } from '$lib/catalog/models/entity';
	import { getLocale } from '$lib/context/locale';
	import ExperienceChip from './ExperienceChip.svelte';
	import Text from './localisation/Text.svelte';
	import { standardAttributes } from './standardattributes';

	export let entity: Entity;
</script>

<a
	{...standardAttributes($$props, 'card-button')}
	data-type={entity.type}
	href="/{getLocale()}/cards/{entity.id}"
>
	<div class="title"><Text {...entity.title} /></div>
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

		@each $type in archetype, trait, skill, ally, item {
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
