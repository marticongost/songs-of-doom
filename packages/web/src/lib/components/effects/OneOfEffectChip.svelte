<script lang="ts">
	import TextList from '$lib/components/localisation/TextList.svelte';
	import Instruction from '$lib/components/structured-text/Instruction.svelte';
	import Operator from '$lib/components/structured-text/Operator.svelte';
	import { OneOfEffect } from '@songsofdoom/game';
	import EffectChip from './EffectChip.svelte';

	interface Props {
		effect: OneOfEffect;
	}

	const { effect }: Props = $props();
</script>

<TextList items={effect.effects} type="or">
	{#snippet comma(sep)}
		<Operator>{sep}</Operator>
	{/snippet}
	{#snippet conjunction(sep)}
		<Instruction>{sep}</Instruction>
	{/snippet}
	{#snippet entry(item)}
		<EffectChip effect={item} />
	{/snippet}
</TextList>
