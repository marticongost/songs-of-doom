<!--
	@component
	A dropdown for selecting sort criteria. Renders a native `<select>` element
	with localised option labels.
-->
<script lang="ts">
	import { getLocale } from '$lib/context/locale';
	import { translate, type LocalisedText } from '$lib/localisation';
	import type { SortCriteriaType } from '$lib/sorting';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';

	interface SortOption {
		value: SortCriteriaType;
		label: LocalisedText;
	}

	interface Props extends StandardAttributeProps {
		/** Available sort options. */
		options: Array<SortOption>;
		/** The currently selected sort value. */
		value: SortCriteriaType;
		/** Called when the user selects a different option. */
		onChange: (value: SortCriteriaType) => void;
	}

	const { options, value, onChange, ...attributes }: Props = $props();

	const locale = getLocale();
</script>

<select
	{...standardAttributes(attributes, 'sort-dropdown')}
	{value}
	onchange={(e) => onChange(e.currentTarget.value as SortCriteriaType)}
>
	{#each options as option (option.value)}
		<option value={option.value}>{translate(option.label, locale)}</option>
	{/each}
</select>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.sort-dropdown {
		@include rz.padding(sm);
		font-family: inherit;
		font-size: inherit;
		color: var(--text-color);
		background-color: var(--panel-background-color);
		border: var(--panel-border);
		border-radius: 0.3em;
	}
</style>
