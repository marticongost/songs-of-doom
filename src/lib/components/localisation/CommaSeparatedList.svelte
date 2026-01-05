<script lang="ts" generics="T">
	import { standardAttributes } from "../standardattributes";
	import type { Snippet } from "svelte";

	import Text from "./Text.svelte";

    export let items: T[];
    export let renderItem: Snippet<[T]>;
    export let operator: "and" | "or" = "and";
</script>

<style lang="scss">
    @use "@reguitzell/styles" as rz;

    .comma-separated-list {
        display: inline;

        & > * {
            display: inline;
        }
    }
</style>

<span {...standardAttributes($$props, "comma-separated-list")}>
    {#each items as item, index}
        {@render renderItem(item)}
        {#if index === items.length - 2}
            {#if operator === "or"}
                <Text ca=" o " es=" o " en=" or "/>
            {:else if operator === "and"}
                <Text ca=" i " es=" y " en=" and "/>
            {/if}
        {:else if index < items.length - 2}
            {", "}
        {/if}
    {/each}
</span>
