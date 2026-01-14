<script lang="ts">
	import EntityGrid from '$lib/components/EntityGrid.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<EntityGrid entities={data.entities} />
