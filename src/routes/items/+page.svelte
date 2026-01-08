<script lang="ts">
	import EntityList from '$lib/components/EntityList.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<EntityList entities={data.items} />
