<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<Card entity={data.entity} />
