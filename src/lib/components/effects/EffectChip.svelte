<script lang="ts">
	import {
		AttachEffect,
		AttackEffect,
		ChangeStatsEffect,
		ChaseEffect,
		ConditionalEffect,
		ConferPropertiesEffect,
		DefendEffect,
		DiscardCardEffect,
		DrawCardsEffect,
		DrawFocusEffect,
		EngageEffect,
		EquipEffect,
		HealEffect,
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
	import { AddChargesEffect } from '$lib/catalog/models/effects/recharge';

	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import AddChargeEffectChip from './AddChargeEffectChip.svelte';
	import AttachEffectChip from './AttachEffectChip.svelte';
	import AttackEffectChip from './AttackEffectChip.svelte';
	import ChangeStatsEffectChip from './ChangeStatsEffectChip.svelte';
	import ChaseEffectChip from './ChaseEffectChip.svelte';
	import ConditionalEffectChip from './ConditionalEffectChip.svelte';
	import ConferPropertiesEffectChip from './ConferPropertiesEffectChip.svelte';
	import DefendEffectChip from './DefendEffectChip.svelte';
	import DiscardCardEffectChip from './DiscardCardEffectChip.svelte';
	import DrawCardsEffectChip from './DrawCardsEffectChip.svelte';
	import DrawFocusEffectChip from './DrawFocusEffectChip.svelte';
	import EngageEffectChip from './EngageEffectChip.svelte';
	import EquipEffectChip from './EquipEffectChip.svelte';
	import HealEffectChip from './HealEffectChip.svelte';
	import ModifyCapabilityCostEffectChip from './ModifyCapabilityCostEffectChip.svelte';
	import ModifyDamageEffectChip from './ModifyDamageEffectChip.svelte';
	import ModifyRollEffectChip from './ModifyRollEffectChip.svelte';
	import NegateDamageEffectChip from './NegateDamageEffectChip.svelte';
	import ReceiveOpportunityAttacksEffectChip from './ReceiveOpportunityAttacksEffectChip.svelte';
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
	{:else if effect instanceof ResultsTableEffect}
		<ResultsTableEffectChip {effect} />
	{:else if effect instanceof TransformFocusEffect}
		<TransformFocusEffectChip {effect} />
	{:else if effect instanceof WoundEffect}
		<WoundEffectChip {effect} />
	{/if}
</span>
