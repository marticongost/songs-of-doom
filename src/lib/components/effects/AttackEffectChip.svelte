<script lang="ts">
    import { AttackEffect } from "$lib/catalog/models/effects";
    import Text from "$lib/components/localisation/Text.svelte";
    import Parameters from "../capabilities/Parameters.svelte";
    import StatExpressionChip from "../StatExpressionChip.svelte";
    import DamageTable from "../damage/DamageTable.svelte";
    import PropertyList from "../properties/PropertyList.svelte";

    export let effect: AttackEffect;
</script>

<Text
    ca="Atac"
    es="Ataque"
    en="Attack"/>
<Parameters>
    <StatExpressionChip statExpression={effect.expression}/>
    <DamageTable damage={effect.damage}/>
    <PropertyList properties={effect.properties}/>
</Parameters>