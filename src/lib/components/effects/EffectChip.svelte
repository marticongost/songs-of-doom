<script lang="ts">
	import {
		AttackEffect,
		ChangeStatsEffect,
		ConditionalEffect,
		DefendEffect,
		DrawAptitudeEffect,
		DrawCardsEffect,
		EngageEffect,
		EphemeralPropertiesEffect,
		ModifyDamageEffect,
		ModifyCapabilityCostEffect,
		ModifyRollEffect,
		NegateDamageEffect,
		ReceiveOpportunityAttacksEffect,
		RepeatCapabilityEffect,
		ResultsTableEffect,
		TriggerAttackEffect,
		WoundEffect,
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
	import EngageEffectChip from './EngageEffectChip.svelte';
	import EphemeralPropertiesEffectChip from './EphemeralPropertiesEffectChip.svelte';
	import ModifyDamageEffectChip from './ModifyDamageEffectChip.svelte';
	import ModifyCapabilityCostEffectChip from './ModifyCapabilityCostEffectChip.svelte';
	import ModifyRollEffectChip from './ModifyRollEffectChip.svelte';
	import NegateDamageEffectChip from './NegateDamageEffectChip.svelte';
	import RechargeEffectChip from './RechargeEffectChip.svelte';
	import ReceiveOpportunityAttacksEffectChip from './ReceiveOpportunityAttacksEffectChip.svelte';
	import RepeatCapabilityEffectChip from './RepeatCapabilityEffectChip.svelte';
	import ResultsTableEffectChip from './ResultsTableEffectChip.svelte';
	import TriggerAttackEffectChip from './TriggerAttackEffectChip.svelte';
	import WoundEffectChip from './WoundEffectChip.svelte';

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
	{:else if effect instanceof EngageEffect}
		<EngageEffectChip {effect} />
	{:else if effect instanceof EphemeralPropertiesEffect}
		<EphemeralPropertiesEffectChip {effect} />
	{:else if effect instanceof ModifyDamageEffect}
		<ModifyDamageEffectChip {effect} />
	{:else if effect instanceof NegateDamageEffect}
		<NegateDamageEffectChip {effect} />
	{:else if effect instanceof ConditionalEffect}
		<ConditionalEffectChip {effect} />
	{:else if effect instanceof TriggerAttackEffect}
		<TriggerAttackEffectChip {effect} />
	{:else if effect instanceof ReceiveOpportunityAttacksEffect}
		<ReceiveOpportunityAttacksEffectChip {effect} />
	{:else if effect instanceof RepeatCapabilityEffect}
		<RepeatCapabilityEffectChip {effect} />
	{:else if effect instanceof ResultsTableEffect}
		<ResultsTableEffectChip {effect} />
	{:else if effect instanceof WoundEffect}
		<WoundEffectChip {effect} />
	{/if}
</div>
