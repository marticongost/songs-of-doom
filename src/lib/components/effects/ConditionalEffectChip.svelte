<script lang="ts">
	import { ConditionalEffect } from '$lib/catalog/models/effects';
	import BlockQuote from '../BlockQuote.svelte';
	import ConditionChip from '../conditions/ConditionChip.svelte';
	import Text from '../localisation/Text.svelte';
	import EffectList from './EffectList.svelte';

	interface Props {
		effect: ConditionalEffect;
	}

	const { effect }: Props = $props();
</script>

{#each effect.cases as conditionCase}
	<div class="case">
		<div class="condition">
			<Text ca="Si" es="Si" en="If" />
			<ConditionChip condition={conditionCase.condition} />
		</div>
		<BlockQuote>
			<EffectList effects={conditionCase.effects} />
		</BlockQuote>
	</div>
{/each}
