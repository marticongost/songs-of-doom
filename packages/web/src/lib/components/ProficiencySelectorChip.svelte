<!--
@component
Renders a static proficiency level or range selector using proficiency indicators.
Use this when displaying which proficiency level triggers an effect (e.g. in a table).
For displaying a dynamic proficiency expression, use ProficiencyChip instead.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		proficiencySelectorChip: {
			whiteSpace: 'nowrap'
		},
		rangeSeparator: {
			marginLeft: css.spacing.xs,
			marginRight: css.spacing.xs
		},
		plus: {
			height: '0.5em',
			color: css.text.positiveColor
		}
	});
</script>

<script lang="ts">
	import type { ProficiencySelector } from '@songsofdoom/game';
	import InlineSvg from './InlineSvg.svelte';
	import ProficiencyIndicator from './indicators/ProficiencyIndicator.svelte';
	import { standardAttributes, type StandardAttributeProps } from './standardattributes';

	interface Props extends StandardAttributeProps {
		/** The proficiency level or range to display. */
		proficiency: ProficiencySelector;
	}

	const { proficiency, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, styles.proficiencySelectorChip)}>
	{#if typeof proficiency === 'number'}
		<ProficiencyIndicator amount={proficiency} />
	{:else if proficiency.min !== undefined && proficiency.max !== undefined}
		<ProficiencyIndicator amount={proficiency.min} />
		<span class={styles.rangeSeparator}>-</span>
		<ProficiencyIndicator amount={proficiency.max} />
	{:else if proficiency.min !== undefined}
		<ProficiencyIndicator amount={proficiency.min} />
		<InlineSvg class={styles.plus} src="plus.svg" />
	{/if}
</span>
