<script lang="ts">
	import type { DistanceCondition } from '$lib/catalog/models/conditions';
	import Text from '../localisation/Text.svelte';

	interface Props {
		condition: DistanceCondition;
	}

	const { condition }: Props = $props();
</script>

{#if condition.steps === 0}
	<Text ca="A la mateixa ubicació" es="En la misma ubicación" en="At the same location" />
{:else if condition.steps === 1}
	<Text ca="A una ubicació adjacent" es="En una ubicación adyacente" en="At an adjacent location" />
{:else}
	<Text
		ca="A %(steps) passos o menys"
		es="A %(steps) pasos o menos"
		en="At %(steps) steps or less"
		steps={condition.steps}
	/>
{/if}
