<script lang="ts">
	import { AttackEffect } from '$lib/catalog/models/effects';
	import Parameters from '../capabilities/Parameters.svelte';
	import DamageTable from '../damage/DamageTable.svelte';
	import ExpressionChip from '../ExpressionChip.svelte';
	import PropertyList from '../properties/PropertyList.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		effect: AttackEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'attack-effect-chip')}>
	Atacar
	<Parameters
		><!--
		--><ExpressionChip expression={effect.expression} /><!--
		--><PropertyList
			properties={effect.properties}
		/><!--
		--></Parameters
	>
	<DamageTable damage={effect.damage} />
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.attack-effect-chip {
		@include rz.row(sm);
		display: inline-flex;
	}
</style>
