<script lang="ts">
    import TraitCard from '$lib/components/traits/TraitCard.svelte';
	import type { Trait } from '$lib/catalog/models/trait';
	import { standardAttributes } from '../standardattributes';

    export let traits: Trait[];
    export let ItemComponent = TraitCard;
</script>

<style lang="scss">
    @use "@reguitzell/styles" as rz;

    .trait-list {
        @include rz.column(md);
    }
</style>

{#if traits.length > 0}
    <div {...standardAttributes($$props, 'trait-list')}>
        {#each traits as trait}
            <svelte:component this={ItemComponent} trait={trait} />
        {/each}
    </div>
{/if}