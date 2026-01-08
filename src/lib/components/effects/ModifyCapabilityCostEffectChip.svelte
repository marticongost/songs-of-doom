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
        <strong>
            <Text ca=" en {value}" es=" en {value}" en=" by {value}"/>
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