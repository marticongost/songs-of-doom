<script lang="ts">
	import { DefendEffect } from '@songsofdoom/game';
	import Parameters from '../capabilities/Parameters.svelte';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import InlineSvg from '../InlineSvg.svelte';
	import PropertyList from '../properties/PropertyList.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		effect: DefendEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'defend-effect-chip')}>
	<InlineSvg src="effects/defense.svg" />
	<ExpressionChip expression={effect.expression} relative={true} />
	{#if effect.properties.length}<Parameters
			><PropertyList properties={effect.properties} /></Parameters
		>{/if}
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;
</style>
