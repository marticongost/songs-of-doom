<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { standardAttributes } from '../standardattributes';
	import Text from './Text.svelte';

	interface Props {
		items: T[];
		renderItem: Snippet<[T]>;
		operator?: 'and' | 'or';
	}

	const { items, renderItem, operator = 'and', ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'comma-separated-list')}>
	{#each items as item, index}
		{@render renderItem(item)}
		{#if index === items.length - 2}
			{#if operator === 'or'}
				<Text ca=" o " es=" o " en=" or " />
			{:else if operator === 'and'}
				<Text ca=" i " es=" y " en=" and " />
			{/if}
		{:else if index < items.length - 2}
			{', '}
		{/if}
	{/each}
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.comma-separated-list {
		display: inline;

		& > * {
			display: inline;
		}
	}
</style>
