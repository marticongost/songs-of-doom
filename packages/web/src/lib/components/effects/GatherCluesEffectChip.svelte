<!--
@component
Renders a gather clues effect, displaying the amount of clues gathered and the source location.
-->
<script lang="ts">
	import ExpressionChip from '$lib/components/expressions/ExpressionChip.svelte';
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import TargetChip from '$lib/components/targets/TargetChip.svelte';
	import type { GatherCluesEffect } from '../../../../../game/src/models/effects/gatherclues';
	import CluesIndicator from '../indicators/CluesIndicator.svelte';

	interface Props extends StandardAttributeProps {
		/** The gather clues effect to render. */
		effect: GatherCluesEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'gather-clues-effect-chip')}>
	{#if typeof effect.amount === 'number'}
		<CluesIndicator amount={effect.amount} />
	{:else}
		<InlineSvg src="effects/clue.svg" /> = <ExpressionChip expression={effect.amount} />
	{/if}
	{#if effect.target.selection !== 'closest' || effect.target.condition || effect.target.cardinality !== 'single'}
		<Text ca="a" es="a" en="at" />
		<TargetChip target={effect.target} />
	{/if}
</span>
