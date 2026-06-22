<script lang="ts">
	import {
		AddChargesEffect,
		AttachEffect,
		AttackEffect,
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
		GoTowardsEffect,
		HealEffect,
		InvestigateEffect,
		LooseGoldEffect,
		ModifyCapabilityCostEffect,
		ModifyCarryingCapacityEffect,
		ModifyConcentrationEffect,
		ModifyDamageEffect,
		ModifyGatheredCluesEffect,
		ModifyRollEffect,
		MoveEffect,
		NarrationEffect,
		NegateDamageEffect,
		OneOfEffect,
		PayEffect,
		PlaceLocationEffect,
		PlayStoryCardsEffect,
		ProficiencyTableEffect,
		ReceiveOpportunityAttacksEffect,
		RecoverSanityEffect,
		RedrawFateEffect,
		RedrawFocusEffect,
		RemoveChargesEffect,
		RepeatCapabilityEffect,
		ReplaceEncounterEffect,
		ReplacePropertyEffect,
		ResolveEncounterEffect,
		ResultsTableEffect,
		SanityLossEffect,
		SaveTargetToVariableEffect,
		SetRollResultEffect,
		TalentEffect,
		TestEffect,
		TransformFocusEffect,
		TriggerActionEffect,
		WoundEffect,
		type Effect
	} from '@songsofdoom/game';

	import { GatherCluesEffect } from '../../../../../game/src/models/effects/gatherclues';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import AddChargeEffectChip from './AddChargeEffectChip.svelte';
	import AttachEffectChip from './AttachEffectChip.svelte';
	import AttackEffectChip from './AttackEffectChip.svelte';
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
	import GatherCluesEffectChip from './GatherCluesEffectChip.svelte';
	import GoTowardsEffectChip from './GoTowardsEffectChip.svelte';
	import HealEffectChip from './HealEffectChip.svelte';
	import InvestigateEffectChip from './InvestigateEffectChip.svelte';
	import LooseGoldEffectChip from './LooseGoldEffectChip.svelte';
	import ModifyCapabilityCostEffectChip from './ModifyCapabilityCostEffectChip.svelte';
	import ModifyCarryingCapacityEffectChip from './ModifyCarryingCapacityEffectChip.svelte';
	import ModifyConcentrationEffectChip from './ModifyConcentrationEffectChip.svelte';
	import ModifyDamageEffectChip from './ModifyDamageEffectChip.svelte';
	import ModifyGatheredCluesEffectChip from './ModifyGatheredCluesEffectChip.svelte';
	import ModifyRollEffectChip from './ModifyRollEffectChip.svelte';
	import MoveEffectChip from './MoveEffectChip.svelte';
	import NarrationEffectChip from './NarrationEffectChip.svelte';
	import NegateDamageEffectChip from './NegateDamageEffectChip.svelte';
	import OneOfEffectChip from './OneOfEffectChip.svelte';
	import PayEffectChip from './PayEffectChip.svelte';
	import PlaceLocationEffectChip from './PlaceLocationEffectChip.svelte';
	import PlayStoryCardsEffectChip from './PlayStoryCardsEffectChip.svelte';
	import ProficiencyTableEffectChip from './ProficiencyTableEffectChip.svelte';
	import ReceiveOpportunityAttacksEffectChip from './ReceiveOpportunityAttacksEffectChip.svelte';
	import RecoverSanityEffectChip from './RecoverSanityEffectChip.svelte';
	import RedrawFateEffectChip from './RedrawFateEffectChip.svelte';
	import RedrawFocusEffectChip from './RedrawFocusEffectChip.svelte';
	import RemoveChargesEffectChip from './RemoveChargesEffectChip.svelte';
	import RepeatCapabilityEffectChip from './RepeatCapabilityEffectChip.svelte';
	import ReplaceEncounterEffectChip from './ReplaceEncounterEffectChip.svelte';
	import ReplacePropertyEffectChip from './ReplacePropertyEffectChip.svelte';
	import ResolveEncounterEffectChip from './ResolveEncounterEffectChip.svelte';
	import ResultsTableEffectChip from './ResultsTableEffectChip.svelte';
	import SanityLossEffectChip from './SanityLossEffectChip.svelte';
	import SaveTargetToVariableEffectChip from './SaveTargetToVariableEffectChip.svelte';
	import SetRollResultEffectChip from './SetRollResultEffectChip.svelte';
	import TalentEffectChip from './TalentEffectChip.svelte';
	import TestEffectChip from './TestEffectChip.svelte';
	import TransformFocusEffectChip from './TransformFocusEffectChip.svelte';
	import TriggerActionEffectChip from './TriggerActionEffectChip.svelte';
	import WoundEffectChip from './WoundEffectChip.svelte';

	interface Props extends StandardAttributeProps {
		effect: Effect;
		compact?: boolean;
	}

	const { effect, compact = true, ...attributes }: Props = $props();
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
	{:else if effect instanceof ModifyConcentrationEffect}
		<ModifyConcentrationEffectChip {effect} />
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
	{:else if effect instanceof RecoverSanityEffect}
		<RecoverSanityEffectChip {effect} />
	{:else if effect instanceof InvestigateEffect}
		<InvestigateEffectChip {effect} />
	{:else if effect instanceof ConferPropertiesEffect}
		<ConferPropertiesEffectChip {effect} />
	{:else if effect instanceof ModifyDamageEffect}
		<ModifyDamageEffectChip {effect} />
	{:else if effect instanceof ModifyGatheredCluesEffect}
		<ModifyGatheredCluesEffectChip {effect} />
	{:else if effect instanceof NegateDamageEffect}
		<NegateDamageEffectChip {effect} />
	{:else if effect instanceof ConditionalEffect}
		<ConditionalEffectChip {effect} {compact} />
	{:else if effect instanceof TriggerActionEffect}
		<TriggerActionEffectChip {effect} />
	{:else if effect instanceof ReceiveOpportunityAttacksEffect}
		<ReceiveOpportunityAttacksEffectChip {effect} />
	{:else if effect instanceof RepeatCapabilityEffect}
		<RepeatCapabilityEffectChip {effect} />
	{:else if effect instanceof RedrawFateEffect}
		<RedrawFateEffectChip {effect} />
	{:else if effect instanceof RedrawFocusEffect}
		<RedrawFocusEffectChip {effect} />
	{:else if effect instanceof RemoveChargesEffect}
		<RemoveChargesEffectChip {effect} />
	{:else if effect instanceof ReplaceEncounterEffect}
		<ReplaceEncounterEffectChip {effect} />
	{:else if effect instanceof ReplacePropertyEffect}
		<ReplacePropertyEffectChip {effect} />
	{:else if effect instanceof SaveTargetToVariableEffect}
		<SaveTargetToVariableEffectChip {effect} />
	{:else if effect instanceof ResolveEncounterEffect}
		<ResolveEncounterEffectChip {effect} />
	{:else if effect instanceof SanityLossEffect}
		<SanityLossEffectChip {effect} />
	{:else if effect instanceof PlayStoryCardsEffect}
		<PlayStoryCardsEffectChip {effect} />
	{:else if effect instanceof ProficiencyTableEffect}
		<ProficiencyTableEffectChip {effect} {compact} />
	{:else if effect instanceof ResultsTableEffect}
		<ResultsTableEffectChip {effect} />
	{:else if effect instanceof SetRollResultEffect}
		<SetRollResultEffectChip {effect} />
	{:else if effect instanceof TestEffect}
		<TestEffectChip {effect} />
	{:else if effect instanceof TransformFocusEffect}
		<TransformFocusEffectChip {effect} />
	{:else if effect instanceof WoundEffect}
		<WoundEffectChip {effect} />
	{:else if effect instanceof GatherCluesEffect}
		<GatherCluesEffectChip {effect} />
	{:else if effect instanceof GoTowardsEffect}
		<GoTowardsEffectChip {effect} />
	{:else if effect instanceof TalentEffect}
		<TalentEffectChip {effect} />
	{:else if effect instanceof MoveEffect}
		<MoveEffectChip {effect} />
	{:else if effect instanceof NarrationEffect}
		<NarrationEffectChip {effect} />
	{:else if effect instanceof OneOfEffect}
		<OneOfEffectChip {effect} />
	{:else if effect instanceof PayEffect}
		<PayEffectChip {effect} />
	{:else if effect instanceof PlaceLocationEffect}
		<PlaceLocationEffectChip {effect} />
	{/if}
</span>
