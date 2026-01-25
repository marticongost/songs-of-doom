<script lang="ts">
	import type { EngagedCondition } from '$lib/catalog/models/conditions';
	import Text from '../localisation/Text.svelte';

	interface Props {
		condition: EngagedCondition;
	}

	const { condition }: Props = $props();
</script>

{#if condition.status}
	<Text ca="enfrontat" es="enfrentado" en="engaged" />
{:else}
	<Text ca="no enfrontat" es="no enfrentado" en="not engaged" />
{/if}
