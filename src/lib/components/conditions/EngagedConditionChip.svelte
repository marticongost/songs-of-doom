<script lang="ts">
	import type { EngagedCondition } from '$lib/catalog/models/conditions';
	import Text from '../localisation/Text.svelte';

	interface Props {
		condition: EngagedCondition;
	}

	const { condition }: Props = $props();
</script>

{#if condition.status}
	<Text ca="està enfrontat" es="está enfrentado" en="is engaged" />
{:else}
	<Text ca="no està enfrontat" es="no está enfrentado" en="is not engaged" />
{/if}
