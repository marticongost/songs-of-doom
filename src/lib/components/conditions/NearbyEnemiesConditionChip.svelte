<script lang="ts">
	import type { NearbyEnemiesCondition } from '$lib/catalog/models/conditions';
	import Text from '../localisation/Text.svelte';

	export let condition: NearbyEnemiesCondition;
</script>

<Text
	ca="hi ha {condition.minEnemies} o més enemics a "
	es="hay {condition.minEnemies} o más enemigos en "
	en="there are {condition.minEnemies} or more enemies at "
/>
{#if condition.distance === 0}
	<Text ca="la ubicació" es="la ubicación" en="the location" />
{:else if condition.distance === 1}
	<Text ca="ubicacions adjacents" es="ubicaciones adyacentes" en="adjacent locations" />
{:else}
	<Text
		ca="ubicacions a {condition.distance} passos"
		es="ubicaciones a {condition.distance} pasos"
		en="locations {condition.distance} steps away"
	/>
{/if}
