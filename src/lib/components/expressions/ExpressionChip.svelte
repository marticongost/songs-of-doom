<!--
@component
Renders any expression (scalar or boolean) with proper formatting.
Handles primitives, operations, comparisons, logical operators, and custom expression types.
-->
<script lang="ts">
	import {
		And,
		Comparison,
		Expression,
		Not,
		Or,
		ScalarOperation,
		type BooleanExpressionType,
		type ScalarExpressionType
	} from '$lib/catalog/models/expressions';
	import { Property } from '$lib/catalog/models/properties';
	import { Stat } from '$lib/catalog/models/stats';
	import InlineSvg from '../InlineSvg.svelte';
	import Text from '../localisation/Text.svelte';
	import PropertyChip from '../properties/PropertyChip.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import StatIcon from '../stats/StatIcon.svelte';

	interface Props extends StandardAttributeProps {
		expression?: ScalarExpressionType | BooleanExpressionType;
		relative?: boolean;
	}

	const { expression, relative = false, ...attributes }: Props = $props();
</script>

{#snippet expressionNodeSnippet(expression: ScalarExpressionType | BooleanExpressionType)}
	<!-- Check for custom translations first -->
	{@const translation = expression instanceof Expression ? expression.translate() : undefined}
	{#if translation !== undefined}
		<Text {...translation} />
	{:else if typeof expression === 'number'}
		{#if relative}
			<span class="number">{expression > 0 ? `+${expression}` : expression}</span>
		{:else}
			<span class="number">{expression}</span>
		{/if}
	{:else if expression === 'result'}
		<InlineSvg src="dice/successes.svg" />
	{:else if expression instanceof Stat}
		<StatIcon stat={expression} />

		<!-- Scalar arithmetic operations -->
	{:else if expression instanceof ScalarOperation}
		{@render expressionNodeSnippet(expression.left)}
		<span class="operator">{expression.operator}</span>
		{@render expressionNodeSnippet(expression.right)}

		<!-- Comparisons -->
	{:else if expression instanceof Comparison}
		{@render expressionNodeSnippet(expression.left)}
		<span class="operator">{expression.operator}</span>
		{@render expressionNodeSnippet(expression.right)}

		<!-- Logical operators -->
	{:else if expression instanceof And}
		{#each expression.operands as operand, index}
			{#if index > 0}<span class="operator"><Text ca="I" es="Y" en="AND" /></span>{/if}
			{@render expressionNodeSnippet(operand)}
		{/each}
	{:else if expression instanceof Or}
		{#each expression.operands as operand, index}
			{#if index > 0}<span class="operator"><Text ca="O" es="O" en="OR" /></span>{/if}
			{@render expressionNodeSnippet(operand)}
		{/each}
	{:else if expression instanceof Not}
		<span class="operator"><Text ca="NO" es="NO" en="NOT" /></span>
		{@render expressionNodeSnippet(expression.operand)}

		<!-- Boolean expressions -->
	{:else if expression instanceof Property}
		<PropertyChip property={expression} />
	{/if}
{/snippet}

{#if expression !== undefined}
	<span {...standardAttributes(attributes, 'expression-chip')}>
		{@render expressionNodeSnippet(expression)}
	</span>
{/if}

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.operator {
		font-weight: bold;
		color: var(--text-subtle-color);
	}
</style>
