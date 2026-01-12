<script lang="ts">
	import {
		ChangeStatsEffect,
		DefendEffect,
		DrawCardsEffect,
		AttackEffect,
		ModifyCapabilityCostEffect,
		ModifyRollEffect,
		type Effect,
		DrawAptitudeEffect,
		ConditionalEffect
	} from '$lib/catalog/models/effects';
	import { RechargeEffect } from '$lib/catalog/models/effects/recharge';

	import DrawCardsEffectChip from './DrawCardsEffectChip.svelte';
	import ModifyRollEffectChip from './ModifyRollEffectChip.svelte';
	import ModifyCapabilityCostEffectChip from './ModifyCapabilityCostEffectChip.svelte';
	import ChangeStatsEffectChip from './ChangeStatsEffectChip.svelte';
	import AttackEffectChip from './AttackEffectChip.svelte';
	import RechargeEffectChip from './RechargeEffectChip.svelte';
	import DefendEffectChip from './DefendEffectChip.svelte';
	import DrawAptitudeEffectChip from './DrawAptitudeEffectChip.svelte';
	import ConditionalEffectChip from './ConditionalEffectChip.svelte';

	export let effect: Effect;
</script>

<div class="effect-chip">
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
	{/if}
</div>
