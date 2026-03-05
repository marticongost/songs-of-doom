<script lang="ts">
	import { InvestigateEffect } from '@songsofdoom/game';
	import Parameters from '../capabilities/Parameters.svelte';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import Text from '../localisation/Text.svelte';
	import PropertyList from '../properties/PropertyList.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import ResultsTableEffectChip from './ResultsTableEffectChip.svelte';

	interface Props extends StandardAttributeProps {
		effect: InvestigateEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'investigate-effect-chip')}>
	<Text ca="Investigar" es="Investigar" en="Investigate" />
	<Parameters
		><!--
		--><ExpressionChip expression={effect.expression} /><!--
			--><PropertyList
			properties={effect.properties}
		/><!--
				--></Parameters
	>
	<ResultsTableEffectChip class="investigate-results" effect={effect.results} />
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;
	.investigate-effect-chip {
		:global(.investigate-results) {
			margin-left: rz.size(sm);
		}
	}
</style>
