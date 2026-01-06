<script lang="ts">
    import ItemList from '$lib/components/items/ItemList.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<ItemList items={data.items} />