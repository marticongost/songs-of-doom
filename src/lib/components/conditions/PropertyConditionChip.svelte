<script lang="ts">
	import type { PropertyCondition } from '$lib/catalog/models/conditions';
	import PropertyList from '../properties/PropertyList.svelte';

	interface Props {
		condition: PropertyCondition;
	}

	const { condition }: Props = $props();
</script>

<PropertyList properties={condition.properties} />
