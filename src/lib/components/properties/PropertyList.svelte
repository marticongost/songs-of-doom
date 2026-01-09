<script lang="ts">
	import { CardType } from '$lib/catalog/models/properties';
	import Text from '$lib/components/localisation/Text.svelte';
	import { standardAttributes } from '../standardattributes';

	export let properties: Array<{ title: unknown }> = [];
</script>

{#if properties.length}
	<ul {...standardAttributes($$props, 'property-list')}>
		{#each properties as property}
			<li class={property instanceof CardType ? 'card-type' : ''}>
				<Text {...(property as any).title} />
			</li>
		{/each}
	</ul>
{/if}

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.property-list {
		display: inline;
	}

	li {
		display: inline;
		font-style: italic;

		&.card-type {
			font-weight: bold;
		}
	}

	li + li:before {
		content: ', ';
	}
</style>
