<script lang="ts">
	import type { StatExpression, StatExpressionNode } from '$lib/catalog/models/expression';
	import { Stat } from '$lib/catalog/models/stats';
	import StatIcon from './stats/StatIcon.svelte';

	export let statExpression: StatExpressionNode;
</script>

{#snippet expressionNodeSnippet(node: StatExpressionNode)}
	{#if typeof node === 'number'}
		<span class="number">{node}</span>
	{:else if node instanceof Stat}
		<StatIcon stat={node} />
	{:else}
		{@render expressionNodeSnippet(node[0])}
		<span class="operator">{node[1]}</span>
		{@render expressionNodeSnippet(node[2])}
	{/if}
{/snippet}

<span class="stat-expression-chip">
	{@render expressionNodeSnippet(statExpression)}
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;
</style>
