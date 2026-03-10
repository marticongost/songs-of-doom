<!--
	@component
	A button component that renders as either a `<button>` or `<a>` element.
	When `href` is provided, renders as a link; otherwise renders as a button.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		button: {
			'&:not([data-appearance="transparent"])': {
				...css.hpadding('md'),
				...css.vpadding('sm'),
				backgroundColor: css.palette.buccaneer,
				color: css.palette.white,
				border: 'none',
				borderRadius: css.spacing.sm,
				fontFamily: css.fonts.text,
				fontWeight: 'bold',
				cursor: 'pointer',
				textDecoration: 'none',
				display: 'inline-block',
				'&:hover:not(:disabled, [aria-disabled="true"])': {
					backgroundColor: css.palette.red,
					color: css.palette.white
				},
				'&:focus': {
					backgroundColor: css.palette.red,
					color: css.palette.white,
					outline: css.focus.outline
				},
				'&:disabled, [aria-disabled=true]': {
					opacity: '0.5',
					cursor: 'not-allowed'
				}
			},
			'&[data-appearance="transparent"]': {
				border: 'none',
				padding: '0',
				background: 'none',
				fontSize: 'inherit',
				'&:focus': {
					outline: css.focus.outline
				}
			}
		}
	});
</script>

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
		{...standardAttributes(attributes, styles.button)}
		{href}
		aria-disabled={disabled || undefined}
		data-appearance={appearance}
		onclick={disabled ? undefined : onclick}
	>
		{@render children()}
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
{:else}
	<button
		{...standardAttributes(attributes, styles.button)}
		{type}
		{disabled}
		{onclick}
		{popovertarget}
		{popovertargetaction}
		data-appearance={appearance}
		style:anchor-name={anchor}
	>
		{@render children()}
	</button>
{/if}
