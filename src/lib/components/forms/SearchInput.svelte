<!--
@component
A search input with locale-aware placeholder and optional search icon.
Designed for filtering content by text search.

@example
```svelte
<SearchInput bind:value={query} autofocus />
```
-->
<script lang="ts" module>
	const defaultPlaceholder: LocalisedText = {
		ca: 'Cercar...',
		es: 'Buscar...',
		en: 'Search...'
	};

	const defaultAriaLabel: LocalisedText = {
		ca: 'Cerca',
		es: 'Búsqueda',
		en: 'Search'
	};
</script>

<script lang="ts">
	import Input from '$lib/components/forms/Input.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { getLocale } from '$lib/context/locale';
	import { translate, type LocalisedText } from '$lib/localisation';

	interface Props extends StandardAttributeProps {
		/** Current search query */
		value?: string;

		/** Custom placeholder text (overrides default) */
		placeholder?: LocalisedText;

		/** Whether to auto-focus on mount */
		autofocus?: boolean;

		/** Accessible label for screen readers */
		'aria-label'?: LocalisedText;

		/** Called when input value changes */
		oninput?: (e: Event & { currentTarget: HTMLInputElement }) => void;
	}

	let {
		value = $bindable(''),
		placeholder = defaultPlaceholder,
		autofocus = false,
		'aria-label': ariaLabel = defaultAriaLabel,
		oninput,
		...attributes
	}: Props = $props();

	const locale = getLocale();
</script>

<Input
	{...standardAttributes(attributes, 'search-input')}
	type="search"
	bind:value
	placeholder={translate(placeholder, locale)}
	icon="search.svg"
	{autofocus}
	aria-label={translate(ariaLabel, locale)}
	{oninput}
/>
