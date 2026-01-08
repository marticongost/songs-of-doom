<script lang="ts" module>
    type SymbolType = "parens" | "angleBrackets"
    const symbols: Record<SymbolType, [string, string]> = {
        parens: ["(", ")"],
        angleBrackets: ["<", ">"]
    }
</script>

<script lang="ts">
    export let symbolType: SymbolType = "parens"
</script>

<style lang="scss">
    @use "@reguitzell/styles" as rz;

    :global(.parameter-items > * + *) {
        margin-left: rz.size(sm);
    }

    .symbol {
        color: var(--text-subtle-color);
    }
</style>

<span class="parameters">
    <span class="symbol">{symbols[symbolType][0]}</span>
    <span class="parameter-items">
        <slot/>
    </span>
    <span class="symbol">{symbols[symbolType][1]}</span>
</span>