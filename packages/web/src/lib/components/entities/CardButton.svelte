<script lang="ts">
	import type { EntityManager } from '$lib/components/entities/entitymanager';
	import { entityUrl } from '$lib/urls';
	import type { Entity } from '@songsofdoom/game';
	import CardCopiesIndicator from '../indicators/CardCopiesIndicator.svelte';
	import ExperienceIndicator from '../indicators/ExperienceIndicator.svelte';
	import Text from '../localisation/Text.svelte';
	import { type StandardAttributeProps, standardAttributes } from '../standardattributes';
	import CardLevel from './CardLevel.svelte';

	interface Props extends StandardAttributeProps {
		entity: Entity;
		onclick?: (e: MouseEvent) => void;
		/** Optional entity manager for state and interactions */
		entityManager?: EntityManager;
	}

	const { entity, onclick, entityManager: entityManager, ...attributes }: Props = $props();
	const attr = $derived(onclick ? { onclick } : { href: entityUrl.get(entity) });
</script>

<svelte:element
	this={onclick ? 'button' : 'a'}
	{...standardAttributes(attributes, 'card-button')}
	data-type={entity.type.id}
	data-entity={entity.id}
	{...attr}
>
	<div class="title"><Text {...entity.title} /></div>
	{#if entityManager}
		<CardCopiesIndicator amount={entityManager.getNumberOfOwnedCopies(entity)} />
	{/if}
	<CardLevel {entity} />
	{#if entity.xpCost !== undefined}
		<ExperienceIndicator amount={entity.xpCost} />
	{/if}
</svelte:element>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.card-button {
		@include rz.row(sm);
		@include rz.vpadding(sm);
		@include rz.hpadding(md);
		width: 100%;
		height: 2.8em;
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

		&:focus {
			border-color: var(--focus-outline-color);
			outline: none;
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
