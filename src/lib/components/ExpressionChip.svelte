<script lang="ts">
	import type { ExpressionNode } from '$lib/catalog/models/expression';
	import { Stat } from '$lib/catalog/models/stats';
	import InlineSvg from './InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from './standardattributes';
	import StatIcon from './stats/StatIcon.svelte';

	interface Props extends StandardAttributeProps {
		expression: ExpressionNode;
	}

	const { expression: statExpression, ...attributes }: Props = $props();
</script>

{#snippet expressionNodeSnippet(node: ExpressionNode)}
	{#if typeof node === 'number'}
		<span class="number">{node}</span>
	{:else if node === 'result'}
		<InlineSvg src="dice/successes.svg" />
	{:else if node instanceof Stat}
		<StatIcon stat={node} />
	{:else}
		{@render expressionNodeSnippet(node[0])}
		<span class="operator">{node[1]}</span>
		{@render expressionNodeSnippet(node[2])}
	{/if}
{/snippet}

<span {...standardAttributes(attributes, 'stat-expression-chip')}>
	{@render expressionNodeSnippet(statExpression)}
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;
</style>
