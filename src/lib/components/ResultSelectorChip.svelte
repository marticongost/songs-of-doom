<script lang="ts">
	import type { Result, ResultSelector } from '$lib/catalog/models/results';
	import InlineSvg from './InlineSvg.svelte';
	import { standardAttributes } from './standardattributes';

	export let result: ResultSelector;
</script>

{#snippet resultSnippet(result: Result)}
	<InlineSvg src="dice/success-{result}.svg" />
{/snippet}

<span {...standardAttributes($$props, 'result-selector-chip')}>
	{#if typeof result === 'number'}
		{@render resultSnippet(result)}
	{:else if result.min && result.max}
		{#each Array.from({ length: result.max - result.min + 1 }, (_, i) => i + result.min!) as r}
			{@render resultSnippet(r as Result)}
		{/each}
	{:else if result.min}
		{@render resultSnippet(result.min)}
		<span class="plus">+</span>
	{/if}
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	:global(.result-selector-chip svg + svg) {
		margin-left: rz.size(xs);
	}
</style>
