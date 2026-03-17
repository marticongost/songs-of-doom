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
	import { translate } from '@songsofdoom/common/localisation';
	import type { Snippet } from 'svelte';

	interface Props {
		items: T[];
		type?: TextListType;
		comma?: Snippet<[string]>;
		conjunction?: Snippet<[string]>;
		entry: Snippet<[T]>;
	}

	const { items, type = 'and', comma, conjunction, entry }: Props = $props();

	const isConjunction = (index: number) =>
		index === items.length - 1 && (type === 'and' || type === 'or');
</script>

{#each items as item, index (index)}{@const sep = getSeparator(
		index,
		items.length,
		type
	)}{#if sep}{@const snippet = isConjunction(index)
			? conjunction
			: comma}{#if snippet}{@render snippet(sep)}{:else}{sep}{/if}{/if}{@render entry(item)}{/each}
