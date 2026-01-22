<script lang="ts">
	import {
		EngagedCondition,
		NearbyEnemiesCondition,
		WoundedCondition,
		type Condition
	} from '$lib/catalog/models/conditions';
	import EngagedConditionChip from './EngagedConditionChip.svelte';
	import NearbyEnemiesConditionChip from './NearbyEnemiesConditionChip.svelte';
	import WoundedConditionChip from './WoundedConditionChip.svelte';

	interface Props {
		condition: Condition;
	}

	const { condition }: Props = $props();
</script>

{#if condition instanceof EngagedCondition}
	<EngagedConditionChip {condition} />
{:else if condition instanceof NearbyEnemiesCondition}
	<NearbyEnemiesConditionChip {condition} />
{:else if condition instanceof WoundedCondition}
	<WoundedConditionChip {condition} />
{/if}
