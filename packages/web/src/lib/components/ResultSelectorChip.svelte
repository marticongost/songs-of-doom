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
				color: css.palette.opium
			},
			'& + &': {
				marginLeft: css.spacing.xs
			}
		},
		plus: {
			height: '0.5em',
			color: css.text.positiveColor
		}
	});
	const faces: Record<Result, string> = {
		0: 'success-0',
		1: 'success-1',
		2: 'success-2',
		3: 'success-3',
		CF: 'critical-failure',
		twist: 'twist',
		peril: 'peril',
		portent: 'portent',
		despair: 'despair'
	};
</script>

<script lang="ts">
	import type { Result, ResultSelector } from '@songsofdoom/game';
	import { isSigil } from '../../../../game/src/models/results';
	import InlineSvg from './InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from './standardattributes';

	interface Props extends StandardAttributeProps {
		result: ResultSelector;
	}

	const { result, ...attributes }: Props = $props();
</script>

{#snippet resultSnippet(result: Result)}
	<InlineSvg class={styles.die} data-result={result} src="dice/{faces[result]}.svg" />
{/snippet}

<span {...standardAttributes(attributes, styles.resultSelectorChip)}>
	{#if typeof result === 'number' || result === 'CF' || isSigil(result)}
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
