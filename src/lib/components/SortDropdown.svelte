<!--
	@component
	A dropdown for selecting sort criteria. Wraps `Dropdown` with a sort icon
	and sort-specific typing.
-->
<script lang="ts">
	import type { LocalisedText } from '$lib/localisation';
	import type { SortCriteriaType } from '$lib/sorting';
	import Dropdown from '$lib/components/forms/Dropdown.svelte';
	import type { StandardAttributeProps } from '$lib/components/standardattributes';

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
</script>

<Dropdown
	{...attributes}
	{options}
	{value}
	onChange={(v) => onChange(v as SortCriteriaType)}
	icon="sort.svg"
/>
