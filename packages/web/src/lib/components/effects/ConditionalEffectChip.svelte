<script lang="ts">
	import { ConditionalEffect } from '@songsofdoom/game';
	import ArrowIcon from '../ArrowIcon.svelte';
	import Parameters from '../capabilities/Parameters.svelte';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import Text from '../localisation/Text.svelte';
	import EffectList from './EffectList.svelte';

	interface Props {
		effect: ConditionalEffect;
	}

	const { effect }: Props = $props();
</script>

{#each effect.cases as conditionCase, i (i)}
	<span class="instruction">
		<Text ca="Si" es="Si" en="If" />
	</span>
	<Parameters><ExpressionChip expression={conditionCase.condition} /></Parameters>
	<ArrowIcon />
	<EffectList effects={conditionCase.effects} />
{/each}
{#if effect.default?.length}
	<span class="instruction">
		<Text ca="En cas contrari" es="En caso contrario" en="Otherwise" />
	</span>
	<ArrowIcon />
	<EffectList effects={effect.default} />
{/if}

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.instruction {
		font-weight: bold;
		color: var(--instruction-color);
		font-family: var(--instruction-font);
	}
</style>
