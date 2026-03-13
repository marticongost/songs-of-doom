<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		scenarioSigils: {
			...css.column('sm'),
			padding: css.spacing.md
		},
		row: {
			...css.row('lg'),
			'& + &': {
				marginTop: css.spacing.sm,
				paddingTop: css.spacing.sm,
				borderTop: css.separators.cardBorder
			}
		},
		sigil: {
			'--svg-width': '2em',
			'--svg-height': 'auto',
			color: css.text.highlightColor
		}
	});
</script>

<script lang="ts">
	import EffectList from '$lib/components/effects/EffectList.svelte';
	import ResultSelectorChip from '$lib/components/ResultSelectorChip.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { Effect, Sigil } from '@songsofdoom/game';
	import { sigils as sigilKeys } from '@songsofdoom/game';

	interface Props extends StandardAttributeProps {
		/** Effects triggered by each sigil fate token. */
		sigils: Record<Sigil, Effect[]>;
	}

	const { sigils, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, styles.scenarioSigils)}>
	{#each sigilKeys as sigil (sigil)}
		<div class={styles.row}>
			<ResultSelectorChip class={styles.sigil} result={sigil} />
			<EffectList effects={sigils[sigil]} compact={false} />
		</div>
	{/each}
</div>
