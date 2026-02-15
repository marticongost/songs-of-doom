<!--
@component
Renders a capability cost for a given type.

- Focus types with a numeric amount: repeats the focus icon N times
- Focus types with a non-numeric expression: renders `<focus icon> = <ExpressionChip>`
- Other types (exhaust, discard, charges, indicators): renders a single icon
-->
<script lang="ts">
	import type { CapabilityCostType } from '@songsofdoom/game';
	import type { ScalarExpressionType } from '@songsofdoom/game';
	import { focusTypes, type FocusType } from '@songsofdoom/game';
	import { indicatorTypes, type StatType } from '@songsofdoom/game';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import FocusIcon from '../focuses/FocusIcon.svelte';
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

<span {...standardAttributes(attributes, 'capability-cost-chip')} data-type={type}>
	{#if isFocusType && amount !== undefined}
		<FocusIcon focus={type as FocusType} />
		<span class="operator">=</span>
		<ExpressionChip expression={amount} />
	{:else if isFocusType}
		<FocusIcon focus={type as FocusType} />
	{:else if (indicatorTypes as Array<CapabilityCostType>).includes(type)}
		<StatChip stat={type as StatType} />
	{:else if type === 'gold'}
		<InlineSvg class="icon" src="gold.svg" style="color: var(--gold-background-color)" />
	{:else if type === 'charges'}
		<InlineSvg class="icon" src="capabilities/charge.svg" />
	{:else if type === 'exhaust'}
		<InlineSvg class="icon" src="capabilities/exhaust.svg" />
	{:else if type === 'discard'}
		<InlineSvg class="icon" src="capabilities/discard.svg" />
	{/if}
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.operator {
		font-weight: bold;
		color: var(--text-subtle-color);
	}

	.stat-chip {
		@include rz.row(xs);
		display: inline-flex;
		align-items: baseline;

		@each $stat in strength, agility, intelligence, charisma, will, health, sanity {
			&[data-stat='#{$stat}'] {
				color: var(--stat-#{$stat}-color);
			}
		}
	}

	.stat-name {
		font-weight: bold;
	}
</style>
