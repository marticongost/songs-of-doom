<script lang="ts">
	import type { RemoveChargesEffect } from '$lib/catalog/models/effects';
	import ExpressionChip from '../ExpressionChip.svelte';
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
	en="Remove %(expression) charges">
	{#snippet expression()}
		<ExpressionChip expression={effect.amount} />
	{/snippet}
</Text>

<TargetChip relation="possessive" target={effect.target} />
