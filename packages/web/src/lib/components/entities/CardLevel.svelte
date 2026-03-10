<!--
	@component
	Displays the entity's level as a row of dots, one per variant.
	Dots up to the current level are filled; the rest are translucent.
	Renders nothing if the entity has only a single variant (no upgrades).
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		cardLevel: {
			...css.row('xs')
		},
		dot: {
			display: 'block',
			width: '0.5em',
			height: '0.5em',
			borderRadius: '50%',
			backgroundColor: css.text.highlightColor,
			opacity: '0.25'
		},
		filledDot: {
			opacity: '1'
		}
	});
</script>

<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { cx } from '@emotion/css';
	import type { Entity } from '@songsofdoom/game';

	interface Props extends StandardAttributeProps {
		/** The entity whose level to display. */
		entity: Entity;
	}

	const { entity, ...attributes }: Props = $props();
	const hasMultipleVariants = $derived(entity.variants.length > 1);
</script>

{#if hasMultipleVariants}
	<span {...standardAttributes(attributes, styles.cardLevel)}>
		{#each entity.variants as _, i (i)}
			<span class={cx(styles.dot, { [styles.filledDot]: i < entity.level })}></span>
		{/each}
	</span>
{/if}
