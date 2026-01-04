<script lang="ts">
	import type { Capability } from "$lib/catalog/models/capability";
	import CapabilityChip from "./CapabilityChip.svelte";

    export let capabilities: Capability[];
</script>

<style>
    .capability-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5em;
    }
    .capability-list li {
        margin: 0;
        padding: 0;
    }
</style>

{#if capabilities.length > 0}
    <ul class="capability-list">
        {#each capabilities as capability}
            <li>
                <CapabilityChip {capability} />
            </li>
        {/each}
    </ul>
{/if}