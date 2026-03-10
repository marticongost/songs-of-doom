<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		resultSelectorChip: {
			position: 'relative',
			whiteSpace: 'nowrap',
			fontSize: '1.2em'
		},
		die: {
			"&[data-result='CF']": {
				color: 'var(--critical-failure-color)'
			},
			'& + &': {
				marginLeft: css.spacing.xs
			}
		},
		plus: {
			height: '0.5em',
			color: 'var(--positive-color)'
		}
	});
</script>

<script lang="ts">
	import type { Result, ResultSelector } from '@songsofdoom/game';
	import InlineSvg from './InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from './standardattributes';

	interface Props extends StandardAttributeProps {
		result: ResultSelector;
	}

	const { result, ...attributes }: Props = $props();
</script>

{#snippet resultSnippet(result: Result)}
	<InlineSvg
		class={styles.die}
		data-result={result}
		src="dice/{result === 'CF' ? 'critical-failure' : `success-${result}`}.svg"
	/>
{/snippet}

<span {...standardAttributes(attributes, styles.resultSelectorChip)}>
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
		<InlineSvg class={styles.plus} src="plus.svg" />
	{/if}
</span>
