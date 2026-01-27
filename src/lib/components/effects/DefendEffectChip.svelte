<script lang="ts">
	import { DefendEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';
	import Parameters from '../capabilities/Parameters.svelte';
	import ExpressionChip from '../ExpressionChip.svelte';
	import PropertyList from '../properties/PropertyList.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		effect: DefendEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'defend-effect-chip')}>
	<Text ca="Defensar" es="Defender" en="Defend" />
	<Parameters
		><!--
		--><ExpressionChip expression={effect.expression} /><!--
		--><PropertyList
			properties={effect.properties}
		/><!--
	--></Parameters
	>
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.defend-effect-chip {
		@include rz.row(sm);
		display: inline-flex;
	}
</style>
