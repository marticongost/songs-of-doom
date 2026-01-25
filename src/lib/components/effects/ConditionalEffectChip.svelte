<script lang="ts">
	import { ConditionalEffect } from '$lib/catalog/models/effects';
	import BlockQuote from '../BlockQuote.svelte';
	import ConditionList from '../conditions/ConditionList.svelte';
	import EffectList from './EffectList.svelte';

	interface Props {
		effect: ConditionalEffect;
	}

	const { effect }: Props = $props();
</script>

{#each effect.cases as conditionCase}
	<div class="case">
		<div class="condition">
			<ConditionList conditions={[conditionCase.condition]} />
		</div>
		<BlockQuote>
			<EffectList effects={conditionCase.effects} />
		</BlockQuote>
	</div>
{/each}
