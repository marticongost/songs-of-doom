<script lang="ts">
    import { DefendEffect } from "$lib/catalog/models/effects";
    import Text from "$lib/components/localisation/Text.svelte";
    import Parameters from "../capabilities/Parameters.svelte";
    import StatExpressionChip from "../StatExpressionChip.svelte";
    import PropertyList from "../properties/PropertyList.svelte";

    export let effect: DefendEffect;
</script>

<Text
    ca="Defensa"
    es="Defensa"
    en="Defense"/>
<Parameters>
    <StatExpressionChip statExpression={effect.expression}/>
    <PropertyList properties={effect.properties}/>
</Parameters>