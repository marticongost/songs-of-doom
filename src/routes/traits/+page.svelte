<script lang="ts">
	import EntityList from '$lib/components/EntityList.svelte';
	import TraitTreeNode from '$lib/components/traits/TraitTreeNode.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<EntityList entities={data.rootTraits} EntityComponent={TraitTreeNode} />
