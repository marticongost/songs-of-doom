<!--
@component
Displays an expression-based condition that is satisfied when a boolean expression evaluates to true.
-->
<script lang="ts">
	import type { ExpressionCondition } from '$lib/catalog/models/conditions';
	import ExpressionChip from '../ExpressionChip.svelte';
	import Text from '../localisation/Text.svelte';

	interface Props {
		/** The expression condition to display. */
		condition: ExpressionCondition;
	}

	const { condition }: Props = $props();
</script>

<Text ca="Si %(expr)" es="Si %(expr)" en="If %(expr)">
	{#snippet expr()}
		<ExpressionChip expression={condition.expression} />
	{/snippet}
</Text>
