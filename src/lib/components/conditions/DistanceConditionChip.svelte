<script lang="ts">
	import type { DistanceCondition } from '$lib/catalog/models/conditions';
	import Text from '../localisation/Text.svelte';

	interface Props {
		condition: DistanceCondition;
	}

	const { condition }: Props = $props();
</script>

{#if condition.steps === 0}
	<Text ca="a la mateixa ubicació" es="en la misma ubicación" en="at the same location" />
{:else if condition.steps === 1}
	<Text ca="a una ubicació adjacent" es="en una ubicación adyacente" en="at an adjacent location" />
{:else}
	<Text
		ca="a {condition.steps} passos o menys"
		es="a {condition.steps} pasos o menos"
		en="at {condition.steps} steps or less"
	/>
{/if}
