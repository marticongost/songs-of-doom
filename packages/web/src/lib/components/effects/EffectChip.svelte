<script lang="ts">
	import {
		AttachEffect,
		AttackEffect,
		LooseGoldEffect,
		ChangeStatsEffect,
		ChaseEffect,
		ConditionalEffect,
		ConferPropertiesEffect,
		DefendEffect,
		DiscardEffect,
		DiscardFromHandEffect,
		DrawCardsEffect,
		DrawFocusEffect,
		EngageEffect,
		EquipEffect,
		ExhaustEffect,
		HealEffect,
		ModifyCapabilityCostEffect,
		ModifyCarryingCapacityEffect,
		ModifyDamageEffect,
		ModifyRollEffect,
		NegateDamageEffect,
		ReceiveOpportunityAttacksEffect,
		RedrawFateEffect,
		RemoveChargesEffect,
		RepeatCapabilityEffect,
		ReplaceEncounterEffect,
		ResolveEncounterEffect,
		ResultsTableEffect,
		SanityLossEffect,
		TestEffect,
		TransformFocusEffect,
		TalentEffect,
		TriggerAttackEffect,
		WoundEffect,
		GoTowardsEffect,
		ImmobilizeEffect,
		type Effect
	} from '@songsofdoom/game';
	import { AddChargesEffect } from '@songsofdoom/game';

	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import AddChargeEffectChip from './AddChargeEffectChip.svelte';
	import AttachEffectChip from './AttachEffectChip.svelte';
	import AttackEffectChip from './AttackEffectChip.svelte';
	import LooseGoldEffectChip from './LooseGoldEffectChip.svelte';
	import ChangeStatsEffectChip from './ChangeStatsEffectChip.svelte';
	import ChaseEffectChip from './ChaseEffectChip.svelte';
	import ConditionalEffectChip from './ConditionalEffectChip.svelte';
	import ConferPropertiesEffectChip from './ConferPropertiesEffectChip.svelte';
	import DefendEffectChip from './DefendEffectChip.svelte';
	import DiscardEffectChip from './DiscardEffectChip.svelte';
	import DiscardFromHandEffectChip from './DiscardFromHandEffectChip.svelte';
	import DrawCardsEffectChip from './DrawCardsEffectChip.svelte';
	import DrawFocusEffectChip from './DrawFocusEffectChip.svelte';
	import EngageEffectChip from './EngageEffectChip.svelte';
	import EquipEffectChip from './EquipEffectChip.svelte';
	import ExhaustEffectChip from './ExhaustEffectChip.svelte';
	import HealEffectChip from './HealEffectChip.svelte';
	import ModifyCapabilityCostEffectChip from './ModifyCapabilityCostEffectChip.svelte';
	import ModifyCarryingCapacityEffectChip from './ModifyCarryingCapacityEffectChip.svelte';
	import ModifyDamageEffectChip from './ModifyDamageEffectChip.svelte';
	import ModifyRollEffectChip from './ModifyRollEffectChip.svelte';
	import NegateDamageEffectChip from './NegateDamageEffectChip.svelte';
	import ReceiveOpportunityAttacksEffectChip from './ReceiveOpportunityAttacksEffectChip.svelte';
	import RedrawFateEffectChip from './RedrawFateEffectChip.svelte';
	import RemoveChargesEffectChip from './RemoveChargesEffectChip.svelte';
	import RepeatCapabilityEffectChip from './RepeatCapabilityEffectChip.svelte';
	import ReplaceEncounterEffectChip from './ReplaceEncounterEffectChip.svelte';
	import ResolveEncounterEffectChip from './ResolveEncounterEffectChip.svelte';
	import ResultsTableEffectChip from './ResultsTableEffectChip.svelte';
	import SanityLossEffectChip from './SanityLossEffectChip.svelte';
	import TestEffectChip from './TestEffectChip.svelte';
	import TransformFocusEffectChip from './TransformFocusEffectChip.svelte';
	import TalentEffectChip from './TalentEffectChip.svelte';
	import TriggerAttackEffectChip from './TriggerAttackEffectChip.svelte';
	import WoundEffectChip from './WoundEffectChip.svelte';
	import GoTowardsEffectChip from './GoTowardsEffectChip.svelte';
	import ImmobilizeEffectChip from './ImmobilizeEffectChip.svelte';

	interface Props extends StandardAttributeProps {
		effect: Effect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'effect-chip')}>
	{#if effect instanceof DrawCardsEffect}
		<DrawCardsEffectChip {effect} />
	{:else if effect instanceof DiscardEffect}
		<DiscardEffectChip {effect} />
	{:else if effect instanceof DiscardFromHandEffect}
		<DiscardFromHandEffectChip {effect} />
	{:else if effect instanceof ModifyRollEffect}
		<ModifyRollEffectChip {effect} />
	{:else if effect instanceof ModifyCapabilityCostEffect}
		<ModifyCapabilityCostEffectChip {effect} />
	{:else if effect instanceof ModifyCarryingCapacityEffect}
		<ModifyCarryingCapacityEffectChip {effect} />
	{:else if effect instanceof LooseGoldEffect}
		<LooseGoldEffectChip {effect} />
	{:else if effect instanceof ChangeStatsEffect}
		<ChangeStatsEffectChip {effect} />
	{:else if effect instanceof ChaseEffect}
		<ChaseEffectChip {effect} />
	{:else if effect instanceof AttackEffect}
		<AttackEffectChip {effect} />
	{:else if effect instanceof AddChargesEffect}
		<AddChargeEffectChip {effect} />
	{:else if effect instanceof AttachEffect}
		<AttachEffectChip {effect} />
	{:else if effect instanceof DefendEffect}
		<DefendEffectChip {effect} />
	{:else if effect instanceof DrawFocusEffect}
		<DrawFocusEffectChip {effect} />
	{:else if effect instanceof EngageEffect}
		<EngageEffectChip {effect} />
	{:else if effect instanceof EquipEffect}
		<EquipEffectChip {effect} />
	{:else if effect instanceof ExhaustEffect}
		<ExhaustEffectChip {effect} />
	{:else if effect instanceof HealEffect}
		<HealEffectChip {effect} />
	{:else if effect instanceof ConferPropertiesEffect}
		<ConferPropertiesEffectChip {effect} />
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
	{:else if effect instanceof ReplaceEncounterEffect}
		<ReplaceEncounterEffectChip {effect} />
	{:else if effect instanceof ResolveEncounterEffect}
		<ResolveEncounterEffectChip {effect} />
	{:else if effect instanceof SanityLossEffect}
		<SanityLossEffectChip {effect} />
	{:else if effect instanceof ResultsTableEffect}
		<ResultsTableEffectChip {effect} />
	{:else if effect instanceof TestEffect}
		<TestEffectChip {effect} />
	{:else if effect instanceof TransformFocusEffect}
		<TransformFocusEffectChip {effect} />
	{:else if effect instanceof WoundEffect}
		<WoundEffectChip {effect} />
	{:else if effect instanceof GoTowardsEffect}
		<GoTowardsEffectChip {effect} />
	{:else if effect instanceof TalentEffect}
		<TalentEffectChip {effect} />
	{:else if effect instanceof ImmobilizeEffect}
		<ImmobilizeEffectChip {effect} />
	{/if}
</span>
