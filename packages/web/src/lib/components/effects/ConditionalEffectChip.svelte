<script lang="ts">
	import { ConditionalEffect } from '@songsofdoom/game';
	import ArrowIcon from '../ArrowIcon.svelte';
	import Parameters from '../capabilities/Parameters.svelte';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import Text from '../localisation/Text.svelte';
	import Instruction from '../structured-text/Instruction.svelte';
	import EffectList from './EffectList.svelte';

	interface Props {
		effect: ConditionalEffect;
	}

	const { effect }: Props = $props();
</script>

{#each effect.cases as conditionCase, i (i)}
	<Instruction><Text ca="Si" es="Si" en="If" /></Instruction>
	<Parameters><ExpressionChip expression={conditionCase.condition} /></Parameters>
	<ArrowIcon />
	<EffectList effects={conditionCase.effects} />
{/each}
{#if effect.default?.length}
	<Instruction><Text ca="En cas contrari" es="En caso contrario" en="Otherwise" /></Instruction>
	<ArrowIcon />
	<EffectList effects={effect.default} />
{/if}
