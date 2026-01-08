<script lang="ts">
    import { AttackEffect } from "$lib/catalog/models/effects";
    import Text from "$lib/components/localisation/Text.svelte";
    import StatExpressionChip from "../StatExpressionChip.svelte";
    import DamageTable from "../damage/DamageTable.svelte";
    import PropertyList from "../properties/PropertyList.svelte";

    export let effect: AttackEffect;
</script>

<div>
    <Text
        ca="Atacar amb"
        es="Atacar con"
        en="Attack with"/>
    <StatExpressionChip statExpression={effect.expression}/>
    {#if effect.properties.length}
        {", "}
    {/if}
    <PropertyList properties={effect.properties}/>
</div>
<DamageTable damage={effect.damage}/>