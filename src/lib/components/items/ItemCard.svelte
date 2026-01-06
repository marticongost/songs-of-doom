<script lang="ts">
	import type { Item } from "$lib/catalog/models/inventory";
	import Text from "../localisation/Text.svelte";

    export let item: Item
</script>

<style lang="scss">
    @use "@reguitzell/styles" as rz;

    .item-card {
        @include rz.column(sm);
        border: var(--panel-border);
        border-radius: 0.5rem;
        background-color: var(--panel-background-color);
        @include rz.padding(md);
    }

    h1 {
        font-family: var(--heading-font);
        font-size: 1.4rem;
        color: var(--text-heading-color);
    }
</style>

<article class="item-card">
    <h1><Text {...item.title}/></h1>
</article>