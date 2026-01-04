<script lang="ts">
    import TraitList from '$lib/components/traits/TraitList.svelte';
    import TraitTreeNode from '$lib/components/traits/TraitTreeNode.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<TraitList traits={data.rootTraits} ItemComponent={TraitTreeNode} />