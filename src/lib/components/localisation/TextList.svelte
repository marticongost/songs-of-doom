<script lang="ts" module>
	type TextListType = 'commas' | 'and' | 'or' | 'spaces';
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

	const getSeparator = (index: number, total: number, type: TextListType) => {
		if (index === 0) {
			return '';
		}
		if (index == total - 1) {
			if (type === 'and') {
				return translate(andText, getLocale());
			} else if (type === 'or') {
				return translate(orText, getLocale());
			}
		}
		if (type === 'spaces') {
			return ' ';
		}
		return ', ';
	};
</script>

<script lang="ts" generics="T">
	import { getLocale } from '$lib/context/locale';
	import { translate } from '$lib/localisation';
	import type { Snippet } from 'svelte';

	interface Props {
		items: T[];
		renderItem: Snippet<[T]>;
		type?: TextListType;
	}

	const { items, renderItem, type = 'and' }: Props = $props();
</script>

{#snippet entry(item: T)}{@render renderItem(item)}{/snippet}

{#each items as item, index}{getSeparator(index, items.length, type)}{@render entry(item)}{/each}
