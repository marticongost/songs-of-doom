<script lang="ts">
	import {
		AttackEffect,
		ChangeStatsEffect,
		ConditionalEffect,
		DefendEffect,
		DiscardCardEffect,
		DrawFocusEffect,
		DrawCardsEffect,
		EngageEffect,
		EphemeralPropertiesEffect,
		ModifyCapabilityCostEffect,
		ModifyDamageEffect,
		ModifyRollEffect,
		NegateDamageEffect,
		ReceiveOpportunityAttacksEffect,
		RedrawFateEffect,
		RemoveChargesEffect,
		RepeatCapabilityEffect,
		ResultsTableEffect,
		TransformFocusEffect,
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
	import DiscardCardEffectChip from './DiscardCardEffectChip.svelte';
	import DrawFocusEffectChip from './DrawFocusEffectChip.svelte';
	import DrawCardsEffectChip from './DrawCardsEffectChip.svelte';
	import EngageEffectChip from './EngageEffectChip.svelte';
	import EphemeralPropertiesEffectChip from './EphemeralPropertiesEffectChip.svelte';
	import ModifyCapabilityCostEffectChip from './ModifyCapabilityCostEffectChip.svelte';
	import ModifyDamageEffectChip from './ModifyDamageEffectChip.svelte';
	import ModifyRollEffectChip from './ModifyRollEffectChip.svelte';
	import NegateDamageEffectChip from './NegateDamageEffectChip.svelte';
	import ReceiveOpportunityAttacksEffectChip from './ReceiveOpportunityAttacksEffectChip.svelte';
	import RechargeEffectChip from './RechargeEffectChip.svelte';
	import RedrawFateEffectChip from './RedrawFateEffectChip.svelte';
	import RemoveChargesEffectChip from './RemoveChargesEffectChip.svelte';
	import RepeatCapabilityEffectChip from './RepeatCapabilityEffectChip.svelte';
	import ResultsTableEffectChip from './ResultsTableEffectChip.svelte';
	import TransformFocusEffectChip from './TransformFocusEffectChip.svelte';
	import TriggerAttackEffectChip from './TriggerAttackEffectChip.svelte';
	import WoundEffectChip from './WoundEffectChip.svelte';

	interface Props extends StandardAttributeProps {
		effect: Effect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'effect-chip')}>
	{#if effect instanceof DrawCardsEffect}
		<DrawCardsEffectChip {effect} />
	{:else if effect instanceof DiscardCardEffect}
		<DiscardCardEffectChip {effect} />
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
	{:else if effect instanceof DrawFocusEffect}
		<DrawFocusEffectChip {effect} />
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
	{:else if effect instanceof RedrawFateEffect}
		<RedrawFateEffectChip {effect} />
	{:else if effect instanceof RemoveChargesEffect}
		<RemoveChargesEffectChip {effect} />
	{:else if effect instanceof ResultsTableEffect}
		<ResultsTableEffectChip {effect} />
	{:else if effect instanceof TransformFocusEffect}
		<TransformFocusEffectChip {effect} />
	{:else if effect instanceof WoundEffect}
		<WoundEffectChip {effect} />
	{/if}
</span>
