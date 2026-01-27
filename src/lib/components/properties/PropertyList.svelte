<script lang="ts">
	import { type Property } from '$lib/catalog/models/properties';
	import TextList from '../localisation/TextList.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import PropertyChip from './PropertyChip.svelte';

	interface Props extends StandardAttributeProps {
		properties?: Array<Property>;
	}

	const { properties = [], ...attributes }: Props = $props();
</script>

{#snippet propertyChip(property: Property)}<PropertyChip {property} />{/snippet}

{#if properties.length}
	<div {...standardAttributes(attributes, 'property-list')}>
		<TextList items={properties} type="commas" renderItem={propertyChip} />
	</div>
{/if}

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	:global(.property-list) {
		display: inline;
	}
</style>
