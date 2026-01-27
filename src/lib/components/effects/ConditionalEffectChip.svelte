<script lang="ts">
	import { ConditionalEffect } from '$lib/catalog/models/effects';
	import ArrowIcon from '../ArrowIcon.svelte';
	import ConditionList from '../conditions/ConditionList.svelte';
	import EffectList from './EffectList.svelte';

	interface Props {
		effect: ConditionalEffect;
	}

	const { effect }: Props = $props();
</script>

{#each effect.cases as conditionCase}
	<span class="case">
		<ConditionList conditions={[conditionCase.condition]} />
		<ArrowIcon />
		<EffectList effects={conditionCase.effects} />
	</span>
{/each}
