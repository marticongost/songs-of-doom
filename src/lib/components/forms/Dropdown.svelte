<!--
	@component
	A reusable dropdown (`<select>`) with localised option labels and an optional
	leading icon rendered via `InlineSvg`.
-->
<script lang="ts">
	import { getLocale } from '$lib/context/locale';
	import { translate, type LocalisedText } from '$lib/localisation';
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';

	interface Option {
		value: string;
		label: LocalisedText;
	}

	interface Props extends StandardAttributeProps {
		/** Available options. */
		options: Array<Option>;
		/** The currently selected value. */
		value: string;
		/** Called when the user selects a different option. */
		onChange: (value: string) => void;
		/** Optional SVG icon source displayed before the select. */
		icon?: string;
	}

	const { options, value, onChange, icon, ...attributes }: Props = $props();

	const locale = getLocale();
</script>

<span {...standardAttributes(attributes, 'dropdown')} class:has-icon={!!icon}>
	{#if icon}
		<InlineSvg class="dropdown-icon" src={icon} />
	{/if}
	<select {value} onchange={(e) => onChange(e.currentTarget.value)}>
		{#each options as option (option.value)}
			<option value={option.value}>{translate(option.label, locale)}</option>
		{/each}
	</select>
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.dropdown {
		position: relative;
		display: inline-block;

		select {
			@include rz.padding(sm);
			font-family: inherit;
			font-size: inherit;
			color: var(--text-color);
			background-color: var(--panel-background-color);
			border: var(--panel-border);
			border-radius: 0.3em;
		}

		&.has-icon {
			:global(.dropdown-icon) {
				position: absolute;
				left: calc(rz.size(lg) / 2);
				top: 50%;
				transform: translate(-25%, -50%);
				pointer-events: none;
			}

			select {
				padding-left: rz.size(lg);
			}
		}
	}
</style>
