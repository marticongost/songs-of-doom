<script lang="ts">
	import { ChangeStatsEffect, DefendEffect, DrawCardsEffect, AttackEffect, ModifyCapabilityCostEffect, ModifyRollEffect, type Effect } from "$lib/catalog/models/effects";
	import Text from "$lib/components/localisation/Text.svelte";
	import { plural2 } from "$lib/localisation";
	import { type StatType } from "$lib/catalog/models/stats";
	import StatChip from "../stats/StatChip.svelte";
	import CommaSeparatedList from "../localisation/CommaSeparatedList.svelte";
	import Parameters from "../capabilities/Parameters.svelte";
	import StatExpressionChip from "../StatExpressionChip.svelte";
	import DamageTable from "../damage/DamageTable.svelte";
	import { RechargeEffect } from "$lib/catalog/models/effects/recharge";
	import PropertyList from "../properties/PropertyList.svelte";

    export let effect: Effect;
</script>

{#snippet renderStatValue([stat, value]: [string, number])}
    <span>
        <StatChip stat={stat as StatType}/>
        <strong>
            <Text ca=" en {value}" es=" en {value}" en=" by {value}"/>
        </strong>
    </span>
{/snippet}

<div class="effect-chip">
    {#if effect instanceof DrawCardsEffect}
        <Text
            ca="Robar {effect.amount} {plural2(effect.amount, 'carta', 'cartes')}"
            es="Robar {effect.amount} {plural2(effect.amount, 'carta', 'cartas')}"
            en="Draw {effect.amount} {plural2(effect.amount, 'card', 'cards')}"/>
    {:else if effect instanceof ModifyRollEffect}
        {@const absStatModifier = Math.abs(effect.modifier)}
        <Text
            ca="{effect.modifier > 0 ? 'Afegir' : 'Restar'} {absStatModifier} {plural2(absStatModifier, 'dau', 'daus')} a la tirada"
            es="{effect.modifier > 0 ? 'Añadir' : 'Restar'} {absStatModifier} {plural2(absStatModifier, 'dado', 'dados')} a la tirada"
            en="{effect.modifier > 0 ? 'Add' : 'Subtract'} {absStatModifier} {plural2(absStatModifier, 'die', 'dice')} to the roll"/>
    {:else if effect instanceof ModifyCapabilityCostEffect}
        {@const grouppedCosts = effect.group()}
        {#if grouppedCosts.increase}
            <Text
                ca="Augmentar el cost en"
                es="Aumentar el coste en"
                en="Increase the cost "/>
            <CommaSeparatedList items={Object.entries(grouppedCosts.increase)} renderItem={renderStatValue}/>
        {:else if grouppedCosts.decrease}
            <Text
                ca="Reduir el cost en"
                es="Reducir el coste en"
                en="Decrease the cost "/>
            <CommaSeparatedList items={Object.entries(grouppedCosts.decrease)} renderItem={renderStatValue}/>
        {/if}
    {:else if effect instanceof ChangeStatsEffect}
        {@const grouppedChanges = effect.group()}
        {#if grouppedChanges.increase}
            <Text
                ca="Augmentar "
                es="Aumentar "
                en="Increase "/>
            <CommaSeparatedList items={Object.entries(grouppedChanges.increase)} renderItem={renderStatValue}/>
        {:else if grouppedChanges.decrease}
            <Text
                ca="Reduir "
                es="Reducir "
                en="Decrease "/>
            <CommaSeparatedList items={Object.entries(grouppedChanges.decrease)} renderItem={renderStatValue}/>
        {/if}
    {:else if effect instanceof AttackEffect}
        <Text
            ca="Atac"
            es="Ataque"
            en="Attack"/>
        <Parameters>
            <StatExpressionChip statExpression={effect.expression}/>
            <DamageTable damage={effect.damage}/>
            <PropertyList properties={effect.properties}/>
        </Parameters>
    {:else if effect instanceof RechargeEffect}
        {#if effect.amount === "max"}
            <Text
                ca="Recarregar del tot"
                es="Recargar del todo"
                en="Recharge fully"/>
        {:else}
            <Text
                ca="Recuperar fins a {plural2(effect.amount, "una càrrega", `${effect.amount} càrregues`)}"
                es="Recuperar hasta {plural2(effect.amount, "una carga", `${effect.amount} cargas`)}"
                en="Recover up to {plural2(effect.amount, "one charge", `${effect.amount} charges`)}"/>
        {/if}
    {:else if effect instanceof DefendEffect}
        <Text
            ca="Defensa"
            es="Defensa"
            en="Defense"/>
        <Parameters>
            <StatExpressionChip statExpression={effect.expression}/>
            <PropertyList properties={effect.properties}/>
        </Parameters>
    {/if}
</div>