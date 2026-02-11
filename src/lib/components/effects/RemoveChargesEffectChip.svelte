<script lang="ts">
	import type { RemoveChargesEffect } from '$lib/catalog/models/effects';
	import ExpressionChip from '$lib/components/expressions/ExpressionChip.svelte';
	import Text from '../localisation/Text.svelte';
	import TargetChip from '../targets/TargetChip.svelte';

	interface Props {
		effect: RemoveChargesEffect;
	}

	const { effect }: Props = $props();
</script>

<Text
	ca="Eliminar %(expression) càrregues"
	es="Eliminar %(expression) cargas"
	en="Remove %(expression) charges"
>
	{#snippet expression()}
		{#if effect.amount === undefined}
			<Text ca="totes les" es="todas las" en="all" />
		{:else}
			<ExpressionChip expression={effect.amount} />
		{/if}
	{/snippet}
</Text>

<TargetChip relation="possessive" target={effect.target} />
