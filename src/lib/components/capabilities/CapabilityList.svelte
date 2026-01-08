<script lang="ts">
	import type { Capability } from "$lib/catalog/models/capability";
	import CapabilityChip from "./CapabilityChip.svelte";

    export let capabilities: Capability[];
</script>

<style lang="scss">
    @use "@reguitzell/styles" as rz;
    .capability-list {
        @include rz.column(md);
        align-items: stretch;
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