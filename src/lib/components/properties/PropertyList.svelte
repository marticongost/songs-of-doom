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

{#if properties.length}
	<div {...standardAttributes(attributes, 'property-list')}>
		<TextList items={properties} type="commas">
			{#snippet entry(property)}
				<PropertyChip {property} />
			{/snippet}
		</TextList>
	</div>
{/if}

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	:global(.property-list) {
		display: inline;
	}
</style>
