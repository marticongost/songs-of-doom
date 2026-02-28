<!--
@component
Renders a change gold effect, displaying the amount of gold gained or lost and the target.
-->
<script lang="ts">
	import ExpressionChip from '$lib/components/expressions/ExpressionChip.svelte';
	import GoldIcon from '$lib/components/icons/GoldIcon.svelte';
	import GoldIndicator from '$lib/components/indicators/GoldIndicator.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import TargetChip from '$lib/components/targets/TargetChip.svelte';
	import type { LooseGoldEffect } from '@songsofdoom/game';

	interface Props {
		effect: LooseGoldEffect;
	}

	const { effect }: Props = $props();
</script>

<span>
	{#if effect.target}
		<Text ca="Remove" es="Treure" en="Remove" />
	{:else}
		<Text ca="Perdre" es="Perder" en="Lose" />
	{/if}
	{#if typeof effect.amount === 'number'}
		<GoldIndicator amount={effect.amount} />
	{:else}
		<GoldIcon /> = <ExpressionChip expression={effect.amount} />
	{/if}
	<TargetChip target={effect.target} relation="possessive" />
</span>
