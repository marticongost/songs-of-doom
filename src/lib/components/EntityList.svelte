<script lang="ts">
	import type { Entity } from '$lib/catalog/models/entity';
    import Card from '$lib/components/Card.svelte';
	import type { Component } from 'svelte';
	import { standardAttributes } from './standardattributes';

    export let entities: Entity[];
    export let EntityComponent: Component<{entity: Entity}> = Card;
</script>

<style lang="scss">
    @use "@reguitzell/styles" as rz;

    .trait-list {
        @include rz.column(md);
    }
</style>

{#if entities.length > 0}
    <div {...standardAttributes($$props, 'trait-list')}>
        {#each entities as entity}
            <svelte:component this={EntityComponent} {entity} />
        {/each}
    </div>
{/if}