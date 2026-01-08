<script lang="ts">
    import { ChangeStatsEffect, DefendEffect, DrawCardsEffect, AttackEffect, ModifyCapabilityCostEffect, ModifyRollEffect, type Effect } from "$lib/catalog/models/effects";
    import { RechargeEffect } from "$lib/catalog/models/effects/recharge";

    import DrawCardsEffectChip from "./DrawCardsEffectChip.svelte";
    import ModifyRollEffectChip from "./ModifyRollEffectChip.svelte";
    import ModifyCapabilityCostEffectChip from "./ModifyCapabilityCostEffectChip.svelte";
    import ChangeStatsEffectChip from "./ChangeStatsEffectChip.svelte";
    import AttackEffectChip from "./AttackEffectChip.svelte";
    import RechargeEffectChip from "./RechargeEffectChip.svelte";
    import DefendEffectChip from "./DefendEffectChip.svelte";

    export let effect: Effect;
</script>

<div class="effect-chip">
    {#if effect instanceof DrawCardsEffect}
        <DrawCardsEffectChip effect={effect}/>
    {:else if effect instanceof ModifyRollEffect}
        <ModifyRollEffectChip effect={effect}/>
    {:else if effect instanceof ModifyCapabilityCostEffect}
        <ModifyCapabilityCostEffectChip effect={effect}/>
    {:else if effect instanceof ChangeStatsEffect}
        <ChangeStatsEffectChip effect={effect}/>
    {:else if effect instanceof AttackEffect}
        <AttackEffectChip effect={effect}/>
    {:else if effect instanceof RechargeEffect}
        <RechargeEffectChip effect={effect}/>
    {:else if effect instanceof DefendEffect}
        <DefendEffectChip effect={effect}/>
    {/if}
</div>