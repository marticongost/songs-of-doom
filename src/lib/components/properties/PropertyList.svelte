<script lang="ts">
	import { type Property } from '$lib/catalog/models/properties';
	import CommaSeparatedList from '../localisation/CommaSeparatedList.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import PropertyChip from './PropertyChip.svelte';

	interface Props extends StandardAttributeProps {
		properties?: Array<Property>;
	}

	const { properties = [], ...attributes }: Props = $props();
</script>

{#snippet propertyChip(property: Property)}
	<PropertyChip {property} />
{/snippet}

{#if properties.length}
	<CommaSeparatedList
		{...standardAttributes(attributes, 'property-list')}
		items={properties}
		conjunction="none"
		renderItem={propertyChip}
	/>
{/if}

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	:global(.property-list) {
		display: inline;
	}
</style>
