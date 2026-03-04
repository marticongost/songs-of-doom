<!--
@component
Renders any expression (scalar or boolean) with proper formatting.
Handles primitives, operations, comparisons, logical operators, and custom expression types.
-->
<script lang="ts">
	import {
		AndExpression,
		CashExpression,
		ComparisonExpression,
		CountExpression,
		Expression,
		IsExpression,
		NotExpression,
		OrExpression,
		plus,
		Property,
		result,
		ScalarOperation,
		Stat,
		TALENT_PROFICIENCY_PENALTY,
		TalentProficiencyExpression,
		type BooleanExpressionType,
		type ScalarExpressionType
	} from '@songsofdoom/game';
	import GoldIcon from '../icons/GoldIcon.svelte';
	import InlineSvg from '../InlineSvg.svelte';
	import Text from '../localisation/Text.svelte';
	import PropertyChip from '../properties/PropertyChip.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import StatIcon from '../stats/StatIcon.svelte';
	import TalentChip from '../talents/TalentChip.svelte';
	import TargetChip from '../targets/TargetChip.svelte';

	interface Props extends StandardAttributeProps {
		expression?: ScalarExpressionType | BooleanExpressionType;
		relative?: boolean;
	}

	const { expression, relative = false, ...attributes }: Props = $props();
</script>

{#snippet expressionNodeSnippet(expression: ScalarExpressionType | BooleanExpressionType)}
	<!-- Check for custom translations first -->
	{@const translation = expression instanceof Expression ? expression.translate() : undefined}
	{#if relative && !(typeof expression === 'number' && expression < 0)}+{/if}
	{#if translation !== undefined}
		<Text {...translation} />
	{:else if typeof expression === 'number'}
		<span class="number">{expression}</span>
	{:else if expression === result}
		<InlineSvg src="dice/successes.svg" />
	{:else if expression instanceof Stat}
		<StatIcon stat={expression} />

		<!-- Scalar arithmetic operations -->
	{:else if expression instanceof ScalarOperation}
		{@render expressionNodeSnippet(expression.left)}
		<span class="operator">{expression.operator}</span>
		{@render expressionNodeSnippet(expression.right)}

		<!-- Comparisons -->
	{:else if expression instanceof ComparisonExpression}
		{@render expressionNodeSnippet(expression.left)}
		<span class="operator">{expression.operator}</span>
		{@render expressionNodeSnippet(expression.right)}

		<!-- Logical operators -->
	{:else if expression instanceof AndExpression}
		{#each expression.operands as operand, index (index)}
			{#if index > 0}
				<span class="instruction">
					<Text ca=" i " es=" y " en=" and " />
				</span>
			{/if}
			{@render expressionNodeSnippet(operand)}
		{/each}
	{:else if expression instanceof OrExpression}
		{#each expression.operands as operand, index (index)}
			{#if index > 0}<span class="instruction"><Text ca=" o " es=" o " en=" or " /></span>{/if}
			{@render expressionNodeSnippet(operand)}
		{/each}
	{:else if expression instanceof NotExpression}
		<span class="instruction"><Text ca="no " es="no " en="not " /></span>
		{@render expressionNodeSnippet(expression.operand)}

		<!-- IsExpression -->
	{:else if expression instanceof IsExpression}
		<TargetChip target={expression.target} />
		{#if expression.target.cardinality === 'multiple'}
			<Text ca="són" es="son" en="are" />
		{:else}
			<Text ca="és" es="es" en="is" />
		{/if}
		{@render expressionNodeSnippet(expression.expression)}

		<!-- Boolean expressions -->
	{:else if expression instanceof Property}
		<PropertyChip property={expression} />

		<!-- Count expression -->
	{:else if expression instanceof CountExpression}
		<Text ca="Número" es="Número" en="Number" />
		<TargetChip target={expression.target} cardinality="multiple" relation="possessive" />

		<!-- Cash -->
	{:else if expression instanceof CashExpression}
		<GoldIcon />

		<!-- Talent proficiency -->
	{:else if expression instanceof TalentProficiencyExpression}
		<Text
			ca="%(exprWithTalent) amb %(talent) %(or) %(exprWithoutTalent) sense"
			es="%(exprWithTalent) con %(talent) %(or) %(exprWithoutTalent) sin"
			en="%(exprWithTalent) with %(talent) %(or) %(exprWithoutTalent) without"
		>
			{#snippet talent()}
				<TalentChip talent={expression.talent} />
			{/snippet}
			{#snippet exprWithTalent()}
				{@render expressionNodeSnippet(plus(expression.stat, expression.modifier))}
			{/snippet}
			{#snippet or()}
				<span class="instruction"><Text ca=" o " es=" o " en=" or " /></span>
			{/snippet}
			{#snippet exprWithoutTalent()}
				{@render expressionNodeSnippet(
					plus(expression.stat, plus(expression.modifier, TALENT_PROFICIENCY_PENALTY))
				)}
			{/snippet}
		</Text>
	{/if}
{/snippet}

{#if expression !== undefined}
	<span {...standardAttributes(attributes, 'expression-chip')}>
		{@render expressionNodeSnippet(expression)}
	</span>
{/if}

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.instruction {
		font-weight: bold;
		color: var(--instruction-color);
		font-family: var(--instruction-font);
	}

	.operator {
		font-weight: bold;
		color: var(--text-subtle-color);
	}
</style>
