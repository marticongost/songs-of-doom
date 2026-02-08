<script lang="ts">
	import { AttackEffect } from '$lib/catalog/models/effects';
	import ExpressionChip from '$lib/components/expressions/ExpressionChip.svelte';
	import Parameters from '../capabilities/Parameters.svelte';
	import Text from '../localisation/Text.svelte';
	import PropertyList from '../properties/PropertyList.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import ResultsTableEffectChip from './ResultsTableEffectChip.svelte';

	interface Props extends StandardAttributeProps {
		effect: AttackEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'attack-effect-chip')}>
	<Text ca="Atacar" es="Atacar" en="Attack" />
	<Parameters
		><!--
		--><ExpressionChip expression={effect.expression} /><!--
			--><PropertyList
			properties={effect.properties}
		/><!--
				--></Parameters
	>
	<ResultsTableEffectChip class="attack-results" effect={effect.results} />
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;
	.attack-effect-chip {
		:global(.attack-results) {
			margin-left: rz.size(sm);
		}
	}
</style>
