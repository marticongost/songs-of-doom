<script lang="ts">
	import {
		NearbyEnemiesCondition,
		WoundedCondition,
		type Condition
	} from '$lib/catalog/models/conditions';
	import NearbyEnemiesConditionChip from './NearbyEnemiesConditionChip.svelte';
	import WoundedConditionChip from './WoundedConditionChip.svelte';

	interface Props {
		condition: Condition;
	}

	const { condition }: Props = $props();
</script>

{#if condition instanceof NearbyEnemiesCondition}
	<NearbyEnemiesConditionChip {condition} />
{:else if condition instanceof WoundedCondition}
	<WoundedConditionChip {condition} />
{/if}
