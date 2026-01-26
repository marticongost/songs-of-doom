<script lang="ts">
	import type { EngagedCondition } from '$lib/catalog/models/conditions';
	import Text from '../localisation/Text.svelte';

	interface Props {
		condition: EngagedCondition;
	}

	const { condition }: Props = $props();
</script>

{#if condition.status}
	<Text ca="Enfrontat" es="Enfrentado" en="Engaged" />
{:else}
	<Text ca="No enfrontat" es="No enfrentado" en="Not engaged" />
{/if}
