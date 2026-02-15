<!--
@component
Renders a sanity loss effect, displaying the amount of sanity lost and the target.
-->
<script lang="ts">
	import type { SanityLossEffect } from '@songsofdoom/game';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import SanityLossIndicator from '../indicators/SanityLossIndicator.svelte';
	import InlineSvg from '../InlineSvg.svelte';
	import Text from '../localisation/Text.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import TargetChip from '../targets/TargetChip.svelte';

	interface Props extends StandardAttributeProps {
		effect: SanityLossEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'sanity-loss-effect-chip')}>
	{#if typeof effect.amount === 'number'}
		<SanityLossIndicator amount={effect.amount} />
	{:else}
		<InlineSvg src="effects/sanity-loss.svg" style="color: var(--stat-sanity-color)" />
		<Text ca="Dany mental" es="Daño mental" en="Mental damage" />
		<ExpressionChip expression={effect.amount} />
	{/if}
	<TargetChip target={effect.target} relation="to" />
</span>
