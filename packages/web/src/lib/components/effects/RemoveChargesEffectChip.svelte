<script lang="ts">
	import type { RemoveChargesEffect } from '@songsofdoom/game';
	import { expressionPlurality } from '@songsofdoom/game';
	import ExpressionChip from '$lib/components/expressions/ExpressionChip.svelte';
	import Text from '../localisation/Text.svelte';
	import TargetChip from '../targets/TargetChip.svelte';

	interface Props {
		effect: RemoveChargesEffect;
	}

	const { effect }: Props = $props();
</script>

<Text ca="Eliminar %(expression)" es="Eliminar %(expression)" en="Remove %(expression)">
	{#snippet expression()}
		{#if effect.amount === undefined}
			<Text ca="totes les càrregues" es="todas las cargas" en="all charges" />
		{:else}
			<ExpressionChip expression={effect.amount} />
			{#if expressionPlurality(effect.amount) === 1}
				<Text ca="càrrega" es="carga" en="charge" />
			{:else}
				<Text ca="càrregues" es="cargas" en="charges" />
			{/if}
		{/if}
	{/snippet}
</Text>

<TargetChip relation="possessive" target={effect.target} />
