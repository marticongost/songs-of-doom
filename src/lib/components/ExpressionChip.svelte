<script lang="ts">
	import { Comparison, ScalarOperation, type Expression } from '$lib/catalog/models/expression';
	import { Stat } from '$lib/catalog/models/stats';
	import InlineSvg from './InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from './standardattributes';
	import StatIcon from './stats/StatIcon.svelte';

	interface Props extends StandardAttributeProps {
		expression: Expression;
		relative?: boolean;
	}

	const { expression: statExpression, relative = false, ...attributes }: Props = $props();
</script>

{#snippet expressionNodeSnippet(expr: Expression)}
	{#if typeof expr === 'number'}
		{#if relative}
			<span class="number">{expr > 0 ? `+${expr}` : expr}</span>
		{:else}
			<span class="number">{expr}</span>
		{/if}
	{:else if expr === 'result'}
		<InlineSvg src="dice/successes.svg" />
	{:else if expr instanceof Stat}
		<StatIcon stat={expr} />
	{:else if expr instanceof ScalarOperation}
		{@render expressionNodeSnippet(expr.left)}
		<span class="operator">{expr.operator}</span>
		{@render expressionNodeSnippet(expr.right)}
	{:else if expr instanceof Comparison}
		{@render expressionNodeSnippet(expr.left)}
		<span class="operator">{expr.operator}</span>
		{@render expressionNodeSnippet(expr.right)}
	{/if}
{/snippet}

<span {...standardAttributes(attributes, 'stat-expression-chip')}>
	{@render expressionNodeSnippet(statExpression)}
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;
</style>
