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
		type Property,
		type ScalarRuleParams
	} from '@songsofdoom/game';
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
	><!--
	--><Text
		{...property.title}
	/><!--
	-->{#if property instanceof ParametricRuleInstance && property.rule instanceof ScalarRule}<!--
		-->{@const instance =
			property as ParametricRuleInstance<ScalarRuleParams>}<!--
		-->({instance.params
			.value})<!--
	-->{/if}</span
>
