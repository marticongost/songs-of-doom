<script lang="ts">
	import {
		DistanceCondition,
		EngagedCondition,
		ExpressionCondition,
		NearbyEnemiesCondition,
		PropertyCondition,
		WoundedCondition,
		type Condition
	} from '$lib/catalog/models/conditions';
	import DistanceConditionChip from './DistanceConditionChip.svelte';
	import EngagedConditionChip from './EngagedConditionChip.svelte';
	import ExpressionConditionChip from './ExpressionConditionChip.svelte';
	import NearbyEnemiesConditionChip from './NearbyEnemiesConditionChip.svelte';
	import PropertyConditionChip from './PropertyConditionChip.svelte';
	import WoundedConditionChip from './WoundedConditionChip.svelte';

	interface Props {
		condition: Condition;
	}

	const { condition }: Props = $props();
</script>

{#if condition instanceof DistanceCondition}
	<DistanceConditionChip {condition} />
{:else if condition instanceof EngagedCondition}
	<EngagedConditionChip {condition} />
{:else if condition instanceof ExpressionCondition}
	<ExpressionConditionChip {condition} />
{:else if condition instanceof NearbyEnemiesCondition}
	<NearbyEnemiesConditionChip {condition} />
{:else if condition instanceof PropertyCondition}
	<PropertyConditionChip {condition} />
{:else if condition instanceof WoundedCondition}
	<WoundedConditionChip {condition} />
{/if}
