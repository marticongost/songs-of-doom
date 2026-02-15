<script lang="ts">
	import { ResultsTableEffect } from '@songsofdoom/game';
	import ArrowIcon from '../ArrowIcon.svelte';
	import ResultSelectorChip from '../ResultSelectorChip.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import EffectList from './EffectList.svelte';

	interface Props extends StandardAttributeProps {
		effect: ResultsTableEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'result-table-effect-chip')}>
	{#each effect.entries as entry, i (i)}
		<span class="entry">
			<ResultSelectorChip class="result" result={entry.result} />
			<ArrowIcon class="arrow-icon" />
			<EffectList class="effects" effects={entry.effects} />
		</span>
	{/each}
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.entry + .entry {
		margin-left: rz.size(sm);
	}
</style>
