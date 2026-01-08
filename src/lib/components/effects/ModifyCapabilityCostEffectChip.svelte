<script lang="ts">
    import { ModifyCapabilityCostEffect } from "$lib/catalog/models/effects";
    import Text from "$lib/components/localisation/Text.svelte";
    import CommaSeparatedList from "../localisation/CommaSeparatedList.svelte";
    import StatChip from "../stats/StatChip.svelte";
    import { type StatType } from "$lib/catalog/models/stats";

    export let effect: ModifyCapabilityCostEffect;
</script>

{#snippet renderStatValue([stat, value]: [string, number])}
    <span>
        <StatChip stat={stat as StatType}/>
        <Text ca=" en " es=" en " en=" by "/>
        <strong>
            {value}
        </strong>
    </span>
{/snippet}

{#if effect.group().increase}
    <Text
        ca="Augmentar el cost en"
        es="Aumentar el coste en"
        en="Increase the cost "/>
    <CommaSeparatedList items={Object.entries(effect.group().increase!)} renderItem={renderStatValue}/>
{:else if effect.group().decrease}
    <Text
        ca="Reduir el cost en"
        es="Reducir el coste en"
        en="Decrease the cost "/>
    <CommaSeparatedList items={Object.entries(effect.group().decrease!)} renderItem={renderStatValue}/>
{/if}