<script lang="ts">
	import { attributeTypes, type AttributeType, type StatType } from '$lib/catalog/models/stats';
	import { standardAttributes, type StandardAttributeProps } from './standardattributes';
	import StatIcon from './stats/StatIcon.svelte';

	interface Props extends StandardAttributeProps {
		attributes: Record<AttributeType, number>;
	}

	const { attributes, ...rest }: Props = $props();
</script>

<div {...standardAttributes(rest, 'attributes-sheet')}>
	{#each attributeTypes as attributeType (attributeType)}
		{@const value = attributes[attributeType]}
		<span class="attribute" data-stat={attributeType}>
			<StatIcon class="attribute-icon" stat={attributeType as StatType} />
			<span class="attribute-value">{value}</span>
		</span>
	{/each}
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.attributes-sheet {
		@include rz.column;
		background-image: linear-gradient(to right, transparent, rgba(black, 0.1));
		border-right: var(--panel-separator);
	}

	.attribute {
		flex: 1;
		@include rz.row(sm);
		@include rz.hpadding(sm);
		justify-content: center;
		align-items: center;

		:global(.attribute-icon) {
			height: 1.4em;
		}

		& + .attribute {
			border-top: 1px solid rgba(white, 0.05);
		}
	}

	.attribute-value {
		font-weight: bold;
		font-size: 1.5em;
	}
</style>
