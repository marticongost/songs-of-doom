<!--
@component
Search input that filters rule entries by title and body content.

@example
```svelte
<RuleSearch {entries} {bodyTexts} {onFilter} />
```
-->
<script lang="ts">
	import SearchInput from '$lib/components/forms/SearchInput.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { getLocale } from '$lib/context/locale';
	import { translate } from '$lib/localisation';
	import type { RuleEntry } from '$lib/rules-reference/types';
	import { matchesAllTerms, parseSearchQuery } from '$lib/search';

	interface Props extends StandardAttributeProps {
		/** All rule entries to search through */
		entries: Array<RuleEntry>;
		/** Body text by slug, extracted from DOM after mount */
		bodyTexts: Record<string, string>;
		/** Called with filtered entries whenever the search results change */
		onFilter: (filtered: Array<RuleEntry>) => void;
	}

	const { entries, bodyTexts, onFilter, ...attributes }: Props = $props();
	const locale = getLocale();

	let query = $state('');

	const filtered = $derived.by(() => {
		const terms = parseSearchQuery(query);
		if (terms.length === 0) return entries;

		return entries.filter((entry) => {
			const title = translate(entry.title, locale);
			const body = bodyTexts[entry.slug] ?? '';
			return matchesAllTerms(title, terms) || matchesAllTerms(body, terms);
		});
	});

	$effect(() => {
		onFilter(filtered);
	});
</script>

<div class="rule-search">
	<SearchInput
		{...standardAttributes(attributes)}
		bind:value={query}
		autofocus={true}
		placeholder={{ ca: 'Cercar regles...', es: 'Buscar reglas...', en: 'Search rules...' }}
	/>
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.rule-search {
		margin-bottom: rz.size(lg);

		:global(.input-wrapper) {
			width: 100%;
		}
	}
</style>
