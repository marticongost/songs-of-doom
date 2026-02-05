<!--
@component
Renders a heal effect, displaying the amount of damage removed and the target.
-->
<script lang="ts">
	import type { HealEffect } from '$lib/catalog/models/effects';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import InlineSvg from '../InlineSvg.svelte';
	import Text from '../localisation/Text.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import TargetChip from '../targets/TargetChip.svelte';

	interface Props extends StandardAttributeProps {
		effect: HealEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'heal-effect-chip')}>
	<Text ca="Curar" es="Curar" en="Heal" />
	<ExpressionChip expression={effect.amount} />
	<InlineSvg class="health-icon" src="stats/health.svg" />
	<TargetChip target={effect.target} ellideSelf={true} relation="to" />
</span>

<style lang="scss">
	.heal-effect-chip {
		& > :global(.health-icon) {
			width: 1.25em;
			height: 1.25em;
			color: var(--stat-health-color);
		}
	}
</style>
