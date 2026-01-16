<script lang="ts">
	import { ResultsTableEffect, Effect, type ResultsTableEntry } from '$lib/catalog/models/effects';
	import InlineSvg from '../InlineSvg.svelte';
	import ResultSelectorChip from '../ResultSelectorChip.svelte';
	import { standardAttributes } from '../standardattributes';
	import EffectList from './EffectList.svelte';
	export let effect: ResultsTableEffect;
</script>

<div {...standardAttributes($$props, 'result-table-effect-chip')}>
	{#each effect.entries as entry}
		<div class="entry">
			<ResultSelectorChip class="result" result={entry.result} />
			<InlineSvg class="arrow" src="arrow.svg" />
			<EffectList class="effects" effects={entry.effects} />
		</div>
	{/each}
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.result-table-effect-chip {
		display: table;

		:global(.arrow) {
			color: var(--text-subtle-color);
			width: 1em;
			@include rz.hmargin(sm);
		}
	}

	.entry {
		display: table-row;

		& > :global(*) {
			display: table-cell;
			vertical-align: top;
		}

		& > :global(.arrow) {
			position: relative;
			top: 0.1em;
		}
	}
</style>
