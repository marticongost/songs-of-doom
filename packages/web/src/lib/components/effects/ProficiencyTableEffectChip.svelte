<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		compact: {
			'& > * + *': {
				marginLeft: css.spacing.sm
			}
		},
		table: {
			display: 'table',
			borderCollapse: 'collapse'
		},
		row: {
			display: 'table-row'
		},
		selectorCell: {
			display: 'table-cell',
			whiteSpace: 'nowrap',
			paddingRight: css.spacing.md,
			paddingBottom: css.spacing.sm,
			verticalAlign: 'middle'
		},
		effectsCell: {
			display: 'table-cell',
			paddingBottom: css.spacing.sm,
			verticalAlign: 'middle'
		},
		selector: {
			whiteSpace: 'nowrap'
		}
	});
</script>

<script lang="ts">
	import ArrowIcon from '$lib/components/ArrowIcon.svelte';
	import ProficiencySelectorChip from '$lib/components/ProficiencySelectorChip.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { ProficiencyTableEffect } from '@songsofdoom/game';
	import EffectList from './EffectList.svelte';

	interface Props extends StandardAttributeProps {
		effect: ProficiencyTableEffect;
		compact?: boolean;
	}

	const { effect, compact = true, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, compact ? styles.compact : styles.table)}>
	{#each effect.entries as entry, i (i)}
		<span class={compact ? undefined : styles.row}>
			<span class={compact ? styles.selector : styles.selectorCell}>
				<ProficiencySelectorChip proficiency={entry.proficiency} />
				{#if compact}
					<ArrowIcon />
				{/if}
			</span>
			<span class={compact ? undefined : styles.effectsCell}>
				<EffectList effects={entry.effects} />
			</span>
		</span>
	{/each}
</span>
