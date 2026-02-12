<script lang="ts">
	import { ConditionalEffect } from '$lib/catalog/models/effects';
	import ArrowIcon from '../ArrowIcon.svelte';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import Text from '../localisation/Text.svelte';
	import EffectList from './EffectList.svelte';

	interface Props {
		effect: ConditionalEffect;
	}

	const { effect }: Props = $props();
</script>

{#each effect.cases as conditionCase, i (i)}
	<span class="if">
		<Text ca="SI" es="SI" en="IF" />
	</span>
	<span class="case">
		<ExpressionChip expression={conditionCase.condition} />
		<ArrowIcon />
		<EffectList effects={conditionCase.effects} />
	</span>
{/each}
{#if effect.default?.length}
	<span class="else">
		<Text ca="EN CAS CONTRARI" es="EN CASO CONTRARIO" en="ELSE" />
	</span>
	<ArrowIcon />
	<EffectList effects={effect.default} />
{/if}

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.if,
	.else {
		font-weight: bold;
	}
</style>
