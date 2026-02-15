<script lang="ts">
	import { EntityType, type Property } from '@songsofdoom/game';
	import { ParametricRuleInstance, ScalarRule, type ScalarRuleParams } from '@songsofdoom/game';
	import { Rule } from '@songsofdoom/game';
	import Text from '$lib/components/localisation/Text.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		property: Property;
	}

	const { property, ...attributes }: Props = $props();
</script>

<span
	{...standardAttributes(attributes, 'property-chip')}
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

<style lang="scss">
	@use '@reguitzell/styles' as rz;
	.property-chip {
		white-space: nowrap;
		font-style: italic;
	}
	.type {
		font-weight: bold;
	}
	.rule {
		color: var(--text-highlight);
	}
</style>
