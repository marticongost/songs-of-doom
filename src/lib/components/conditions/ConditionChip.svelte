<script lang="ts">
	import { NearbyEnemiesCondition, type Condition } from '$lib/catalog/models/conditions';
	import NearbyEnemiesConditionChip from './NearbyEnemiesConditionChip.svelte';

	export let condition: Condition;
</script>

{#if condition instanceof NearbyEnemiesCondition}
	<NearbyEnemiesConditionChip {condition} />
{/if}
