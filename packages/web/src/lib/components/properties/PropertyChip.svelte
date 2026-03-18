<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		propertyChip: {
			whiteSpace: 'nowrap',
			fontStyle: 'italic'
		},
		type: {
			fontWeight: 'bold'
		},
		rule: {
			color: css.text.highlightColor
		}
	});
</script>

<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import {
		EntityType,
		ParametricRuleInstance,
		Rule,
		ScalarRule,
		propertyData,
		type Property
	} from '@songsofdoom/game';
	import Parameters from '../capabilities/Parameters.svelte';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		property: Property;
	}

	const { property, ...attributes }: Props = $props();
</script>

<span
	{...standardAttributes(attributes, styles.propertyChip)}
	class:type={property instanceof EntityType}
	class:rule={property instanceof Rule}
>
	<Text {...property.title} />
	{#if property instanceof ParametricRuleInstance && property.rule instanceof ScalarRule}
		<Parameters><ExpressionChip expression={property.params.value} /></Parameters>
	{:else if property instanceof ParametricRuleInstance && property.rule instanceof propertyData.VulnerableRule}
		<Parameters><Text {...property.params.attackType.title} />, +{property.params.value}</Parameters
		>
	{:else if property instanceof ParametricRuleInstance && property.rule instanceof propertyData.InvulnerableRule}
		{#if property.params.attackType !== undefined || property.params.value !== undefined}
			<Parameters
				>{#if property.params.attackType !== undefined}<Text
						{...property.params.attackType.title}
					/>{/if}{#if property.params.value !== undefined}<ExpressionChip
						expression={property.params.value}
					/>{/if}</Parameters
			>{/if}
	{/if}</span
>
