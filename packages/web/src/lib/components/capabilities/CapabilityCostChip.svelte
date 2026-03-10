<!--
@component
Renders a capability cost for a given type.

- Focus types with a numeric amount: repeats the focus icon N times
- Focus types with a non-numeric expression: renders `<focus icon> = <ExpressionChip>`
- Other types (exhaust, discard, charges, indicators): renders a single icon
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		operator: {
			fontWeight: 'bold',
			color: css.text.subtleColor
		}
	});
</script>

<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { CapabilityCostType, ScalarExpressionType } from '@songsofdoom/game';
	import { focusTypes, indicatorTypes, type FocusType, type StatType } from '@songsofdoom/game';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import FocusIcon from '../focuses/FocusIcon.svelte';
	import GoldIcon from '../icons/GoldIcon.svelte';
	import InlineSvg from '../InlineSvg.svelte';
	import StatChip from '../stats/StatChip.svelte';

	interface Props extends StandardAttributeProps {
		type: CapabilityCostType;
		/** The cost amount. For focus types, can be a number (repeated icons) or an expression. */
		amount?: ScalarExpressionType;
	}

	const { type, amount, ...attributes }: Props = $props();
	const isFocusType = $derived((focusTypes as Array<CapabilityCostType>).includes(type));
</script>

<span {...standardAttributes(attributes)} data-type={type}>
	{#if isFocusType && amount !== undefined}
		<FocusIcon focus={type as FocusType} />
		<span class={styles.operator}>=</span>
		<ExpressionChip expression={amount} />
	{:else if isFocusType}
		<FocusIcon focus={type as FocusType} />
	{:else if (indicatorTypes as Array<CapabilityCostType>).includes(type)}
		<StatChip stat={type as StatType} />
	{:else if type === 'gold'}
		<GoldIcon />
	{:else if type === 'charges'}
		<InlineSvg class="icon" src="capabilities/charge.svg" />
	{:else if type === 'exhaust'}
		<InlineSvg class="icon" src="capabilities/exhaust.svg" />
	{:else if type === 'discard'}
		<InlineSvg class="icon" src="capabilities/discard.svg" />
	{/if}
</span>
