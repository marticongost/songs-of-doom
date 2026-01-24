<script lang="ts" module>
	type ConjunctionType = 'none' | 'and' | 'or';
	const orText = {
		ca: ' o ',
		es: ' o ',
		en: ' or '
	};
	const andText = {
		ca: ' i ',
		es: ' y ',
		en: ' and '
	};

	const getSeparator = (index: number, total: number, conjunction: ConjunctionType) => {
		if (index === 0) {
			return '';
		}
		if (index == total - 1) {
			if (conjunction === 'and') {
				return translate(andText, getLocale());
			} else if (conjunction === 'or') {
				return translate(orText, getLocale());
			}
		}
		return ', ';
	};
</script>

<script lang="ts" generics="T">
	import { getLocale } from '$lib/context/locale';
	import { translate } from '$lib/localisation';
	import type { Snippet } from 'svelte';
	import { standardAttributes } from '../standardattributes';

	interface Props {
		items: T[];
		renderItem: Snippet<[T]>;
		conjunction?: ConjunctionType;
	}

	const { items, renderItem, conjunction = 'and', ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'comma-separated-list')}>
	{#each items as item, index}
		{getSeparator(index, items.length, conjunction)}{@render renderItem(item)}
	{/each}
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.comma-separated-list {
		display: inline;
		white-space: break-spaces;

		& > * {
			display: inline;
		}
	}
</style>
