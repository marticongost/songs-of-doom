<script lang="ts">
	import { CardType, type Property } from '$lib/catalog/models/properties';
	import {
		ParametricRuleInstance,
		ScalarRule,
		type ScalarRuleParams
	} from '$lib/catalog/models/properties/parametricrule';
	import { Rule } from '$lib/catalog/models/properties/rule';
	import Text from '$lib/components/localisation/Text.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		property: Property;
	}

	const { property, ...attributes }: Props = $props();
</script>

<span
	{...standardAttributes(attributes, 'property-chip')}
	class:card-type={property instanceof CardType}
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

<style lang="scss">
	@use '@reguitzell/styles' as rz;
	.property-chip {
		white-space: nowrap;
		font-style: italic;
	}
	.card-type {
		font-weight: bold;
	}
	.rule {
		color: var(--text-highlight);
	}
</style>
