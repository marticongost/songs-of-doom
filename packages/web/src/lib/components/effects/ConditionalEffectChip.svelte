<script lang="ts" module>
	import * as css from '$lib/styles';

	export const styles = css.styles({
		nonCompactConditionalEffectChip: {
			...css.column('xs')
		}
	});
</script>

<script lang="ts">
	import { ConditionalEffect } from '@songsofdoom/game';
	import ArrowIcon from '../ArrowIcon.svelte';
	import Parameters from '../capabilities/Parameters.svelte';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import Text from '../localisation/Text.svelte';
	import { type StandardAttributeProps, standardAttributes } from '../standardattributes';
	import Instruction from '../structured-text/Instruction.svelte';
	import EffectList from './EffectList.svelte';

	interface Props extends StandardAttributeProps {
		effect: ConditionalEffect;
		compact?: boolean;
	}

	const { effect, compact = true, ...rest }: Props = $props();
	const caseTag = $derived(compact ? 'span' : 'div');
</script>

<span {...standardAttributes(rest, compact ? undefined : styles.nonCompactConditionalEffectChip)}>
	{#each effect.cases as conditionCase, i (i)}
		<svelte:element this={caseTag}>
			<Instruction><Text ca="Si" es="Si" en="If" /></Instruction>
			<Parameters><ExpressionChip expression={conditionCase.condition} /></Parameters>
			<ArrowIcon />
			<EffectList effects={conditionCase.effects} />
		</svelte:element>
	{/each}
	{#if effect.default?.length}
		<svelte:element this={caseTag}>
			<Instruction><Text ca="En cas contrari" es="En caso contrario" en="Otherwise" /></Instruction>
			<ArrowIcon />
			<EffectList effects={effect.default} />
		</svelte:element>
	{/if}
</span>
