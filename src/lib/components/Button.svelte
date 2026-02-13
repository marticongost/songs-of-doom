<!--
	@component
	A button component that renders as either a `<button>` or `<a>` element.
	When `href` is provided, renders as a link; otherwise renders as a button.
-->
<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { Snippet } from 'svelte';

	interface Props extends StandardAttributeProps {
		/** The button's type */
		type?: 'button' | 'submit' | 'reset';

		/** Whether the button is disabled */
		disabled?: boolean;

		/** Click handler */
		onclick?: (event: MouseEvent) => void;

		/** If provided, renders as an anchor element */
		href?: string;

		/** ID of a popover element to control (only applies to button, not anchor) */
		popovertarget?: string;

		/** Action to perform on the popover: toggle, show, or hide */
		popovertargetaction?: 'toggle' | 'show' | 'hide';

		/** CSS anchor name for anchor positioning (sets anchor-name style property) */
		anchor?: string;

		/** Button content */
		children: Snippet;

		/** The button's appearance. Use `transparent` to create a chromeless button. */
		appearance?: 'primary' | 'transparent';
	}

	const {
		type = 'button',
		disabled = false,
		onclick,
		href,
		popovertarget,
		popovertargetaction,
		anchor,
		children,
		appearance = 'primary',
		...attributes
	}: Props = $props();
</script>

{#if href}
	<!-- eslint-disable svelte/no-navigation-without-resolve -- href is pre-resolved by the caller -->
	<a
		{...standardAttributes(attributes, 'button')}
		{href}
		class:disabled
		class:primary={appearance === 'primary'}
		class:transparent={appearance === 'transparent'}
		aria-disabled={disabled || undefined}
		onclick={disabled ? undefined : onclick}
	>
		{@render children()}
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
{:else}
	<button
		{...standardAttributes(attributes, 'button')}
		{type}
		{disabled}
		{onclick}
		{popovertarget}
		{popovertargetaction}
		class:primary={appearance === 'primary'}
		class:transparent={appearance === 'transparent'}
		style:anchor-name={anchor}
	>
		{@render children()}
	</button>
{/if}

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.button:not(.transparent) {
		@include rz.hpadding(md);
		@include rz.vpadding(sm);
		background-color: var(--button-background-color);
		color: var(--button-foreground-color);
		border: none;
		border-radius: rz.size(sm);
		font-family: var(--text-font);
		font-weight: bold;
		cursor: pointer;
		text-decoration: none;
		display: inline-block;

		&:hover:not(:disabled, .disabled) {
			background-color: var(--button-hover-background-color);
			color: var(--button-hover-foreground-color);
		}

		&:focus {
			background-color: var(--button-hover-background-color);
			color: var(--button-hover-foreground-color);
			outline: var(--focus-outline);
		}

		&:disabled,
		&.disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}

	.transparent {
		border: none;
		padding: 0;
		background: none;
		font-size: inherit;

		&:focus {
			outline: var(--focus-outline);
		}
	}
</style>
