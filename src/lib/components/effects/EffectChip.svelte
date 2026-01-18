<script lang="ts">
	import {
		AttackEffect,
		ChangeStatsEffect,
		ConditionalEffect,
		DefendEffect,
		DrawAptitudeEffect,
		DrawCardsEffect,
		ModifyCapabilityCostEffect,
		ModifyRollEffect,
		ResultsTableEffect,
		TriggerAttackEffect,
		type Effect
	} from '$lib/catalog/models/effects';
	import { RechargeEffect } from '$lib/catalog/models/effects/recharge';

	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import AttackEffectChip from './AttackEffectChip.svelte';
	import ChangeStatsEffectChip from './ChangeStatsEffectChip.svelte';
	import ConditionalEffectChip from './ConditionalEffectChip.svelte';
	import DefendEffectChip from './DefendEffectChip.svelte';
	import DrawAptitudeEffectChip from './DrawAptitudeEffectChip.svelte';
	import DrawCardsEffectChip from './DrawCardsEffectChip.svelte';
	import ModifyCapabilityCostEffectChip from './ModifyCapabilityCostEffectChip.svelte';
	import ModifyRollEffectChip from './ModifyRollEffectChip.svelte';
	import RechargeEffectChip from './RechargeEffectChip.svelte';
	import ResultsTableEffectChip from './ResultsTableEffectChip.svelte';
	import TriggerAttackEffectChip from './TriggerAttackEffectChip.svelte';

	interface Props extends StandardAttributeProps {
		effect: Effect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, 'effect-chip')}>
	{#if effect instanceof DrawCardsEffect}
		<DrawCardsEffectChip {effect} />
	{:else if effect instanceof ModifyRollEffect}
		<ModifyRollEffectChip {effect} />
	{:else if effect instanceof ModifyCapabilityCostEffect}
		<ModifyCapabilityCostEffectChip {effect} />
	{:else if effect instanceof ChangeStatsEffect}
		<ChangeStatsEffectChip {effect} />
	{:else if effect instanceof AttackEffect}
		<AttackEffectChip {effect} />
	{:else if effect instanceof RechargeEffect}
		<RechargeEffectChip {effect} />
	{:else if effect instanceof DefendEffect}
		<DefendEffectChip {effect} />
	{:else if effect instanceof DrawAptitudeEffect}
		<DrawAptitudeEffectChip {effect} />
	{:else if effect instanceof ConditionalEffect}
		<ConditionalEffectChip {effect} />
	{:else if effect instanceof TriggerAttackEffect}
		<TriggerAttackEffectChip {effect} />
	{:else if effect instanceof ResultsTableEffect}
		<ResultsTableEffectChip {effect} />
	{/if}
</div>
