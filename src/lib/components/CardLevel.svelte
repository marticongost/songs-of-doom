<!--
	@component
	Displays the entity's level as a row of dots, one per variant.
	Dots up to the current level are filled; the rest are translucent.
	Renders nothing if the entity has only a single variant (no upgrades).
-->
<script lang="ts">
	import type { Entity } from '$lib/catalog/models/entity';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';

	interface Props extends StandardAttributeProps {
		/** The entity whose level to display. */
		entity: Entity;
	}

	const { entity, ...attributes }: Props = $props();
	const hasMultipleVariants = $derived(entity.variants.length > 1);
</script>

{#if hasMultipleVariants}
	<span {...standardAttributes(attributes, 'card-level')}>
		{#each entity.variants as _, i (i)}
			<span class="dot" class:filled={i < entity.level}></span>
		{/each}
	</span>
{/if}

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.card-level {
		@include rz.row(xs);
		align-items: center;
	}

	.dot {
		display: block;
		width: 0.5em;
		height: 0.5em;
		border-radius: 50%;
		background-color: var(--text-highlight);
		opacity: 0.25;

		&.filled {
			opacity: 1;
		}
	}
</style>
