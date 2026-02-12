<script lang="ts">
	import type { Result, ResultSelector } from '$lib/catalog/models/results';
	import InlineSvg from './InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from './standardattributes';

	interface Props extends StandardAttributeProps {
		result: ResultSelector;
	}

	const { result, ...attributes }: Props = $props();
</script>

{#snippet resultSnippet(result: Result)}
	<InlineSvg
		class="die"
		data-result={result}
		src="dice/{result === 'CF' ? 'critical-failure' : `success-${result}`}.svg"
	/>
{/snippet}

<span {...standardAttributes(attributes, 'result-selector-chip')}>
	{#if typeof result === 'number' || result === 'CF'}
		{@render resultSnippet(result)}
	{:else if result instanceof Array}
		{#each result as r (r)}
			{@render resultSnippet(r)}
		{/each}
	{:else if result.min && result.max}
		{#each Array.from({ length: result.max - result.min + 1 }, (_, i) => i + result.min!) as r (r)}
			{@render resultSnippet(r as Result)}
		{/each}
	{:else if result.min}
		{@render resultSnippet(result.min)}
		<InlineSvg class="plus" src="plus.svg" />
	{/if}
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.result-selector-chip {
		position: relative;
		white-space: nowrap;
		font-size: 1.2em;

		:global(.die[data-result='CF']) {
			color: var(--critical-failure-color);
		}

		:global(.die + .die) {
			margin-left: rz.size(xs);
		}

		:global(.plus) {
			height: 0.5em;
			color: var(--positive-color);
		}
	}
</style>
