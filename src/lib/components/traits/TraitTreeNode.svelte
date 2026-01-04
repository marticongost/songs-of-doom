<script lang="ts">
    import TraitTreeNode from '$lib/components/traits/TraitTreeNode.svelte';
    import TraitCard from '$lib/components/traits/TraitCard.svelte';
	import type { Trait } from '$lib/catalog/models/trait';
	import TraitList from './TraitList.svelte';
	import { standardAttributes } from '../standardattributes';

    export let trait: Trait;
</script>

<style>
    .trait-tree-node :global(.subtraits) {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-left: 1.5rem;
        margin-top: 0.5rem;
    }
</style>

<div {...standardAttributes($$props, 'trait-tree-node')}>
    <TraitCard {trait} />
    <TraitList class="subtraits" traits={trait.subtraits} ItemComponent={TraitTreeNode} />
</div>