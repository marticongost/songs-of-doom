<!--
@component
Search input that filters rule entries by title and body content.

@example
```svelte
<RuleSearch {entries} {bodyTexts} {onFilter} />
```
-->
<script lang="ts">
	import { getLocale } from '$lib/context/locale';
	import { translate } from '$lib/localisation';
	import type { RuleEntry } from '$lib/rules-reference/types';

	interface Props {
		/** All rule entries to search through */
		entries: Array<RuleEntry>;
		/** Body text by slug, extracted from DOM after mount */
		bodyTexts: Record<string, string>;
		/** Called with filtered entries whenever the search results change */
		onFilter: (filtered: Array<RuleEntry>) => void;
	}

	const { entries, bodyTexts, onFilter }: Props = $props();
	const locale = getLocale();

	let query = $state('');

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return entries;

		return entries.filter((entry) => {
			const title = translate(entry.title, locale).toLowerCase();
			const body = (bodyTexts[entry.slug] ?? '').toLowerCase();
			return title.includes(q) || body.includes(q);
		});
	});

	$effect(() => {
		onFilter(filtered);
	});
</script>

<div class="rule-search">
	<input
		type="search"
		placeholder={translate(
			{ ca: 'Cercar regles...', es: 'Buscar reglas...', en: 'Search rules...' },
			locale
		)}
		bind:value={query}
	/>
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.rule-search {
		margin-bottom: rz.size(lg);
	}

	input[type='search'] {
		width: 100%;
		padding: rz.size(sm) rz.size(md);
		font-size: inherit;
		border: var(--panel-separator);
		border-radius: rz.size(xs);
		background: var(--panel-background-color);
		color: inherit;

		&:focus {
			outline: 2px solid var(--text-highlight);
			outline-offset: 1px;
		}
	}
</style>
