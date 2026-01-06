<script lang="ts">
    import TraitTreeNode from '$lib/components/traits/TraitTreeNode.svelte';
    import Card from '$lib/components/Card.svelte';
	import { standardAttributes } from '../standardattributes';
	import type { Entity } from '$lib/catalog/models/entity';
	import { Trait } from '$lib/catalog/models/trait';
	import EntityList from '../EntityList.svelte';

    export let entity: Entity;
</script>

<style lang="scss">
    @use "@reguitzell/styles" as rz;

    .trait-tree-node :global(.subtraits) {
        @include rz.column(md);
        margin-left: 1.5rem;
        margin-top: 0.5rem;
    }
</style>

<div {...standardAttributes($$props, 'trait-tree-node')}>
    <Card entity={entity} />
    {#if entity instanceof Trait}
        <EntityList class="subtraits" entities={entity.subtraits} EntityComponent={TraitTreeNode} />
    {/if}
</div>