<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		propertyList: {
			display: 'inline'
		}
	});
</script>

<script lang="ts">
	import { type Property } from '@songsofdoom/game';
	import TextList from '../localisation/TextList.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import PropertyChip from './PropertyChip.svelte';

	interface Props extends StandardAttributeProps {
		properties?: Array<Property>;
	}

	const { properties = [], ...attributes }: Props = $props();
</script>

{#if properties.length}
	<div {...standardAttributes(attributes, styles.propertyList)}>
		<TextList items={properties} type="commas">
			{#snippet entry(property)}
				<PropertyChip {property} />
			{/snippet}
		</TextList>
	</div>
{/if}
