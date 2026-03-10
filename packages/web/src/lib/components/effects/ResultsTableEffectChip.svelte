<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		entry: {
			'& + &': {
				marginLeft: css.spacing.sm
			}
		},
		selector: {
			whiteSpace: 'nowrap'
		}
	});
</script>

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
		<span class={styles.entry}>
			<span class={styles.selector}>
				<ResultSelectorChip class="result" result={entry.result} />
				<ArrowIcon class="arrow-icon" />
			</span>
			<EffectList class="effects" effects={entry.effects} />
		</span>
	{/each}
</span>
