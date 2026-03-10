<!--
@component
A styled text input with optional leading icon.

@example
```svelte
<Input type="text" placeholder="Enter text..." bind:value />
```
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		inputWrapper: {
			position: 'relative',
			display: 'inline-block'
		},
		input: {
			...css.vpadding('sm'),
			...css.hpadding('md'),
			width: '100%',
			height: css.forms.controlHeight,
			fontFamily: 'inherit',
			fontSize: 'inherit',
			color: css.text.regularColor,
			backgroundColor: css.forms.controlBackgroundColor,
			border: css.forms.controlBorder,
			borderRadius: css.spacing.sm,
			'&:focus': {
				border: css.focus.outline,
				outline: 'none'
			},
			'&::placeholder': {
				color: 'inherit',
				opacity: '0.6'
			}
		},
		inputWithIcon: {
			paddingLeft: css.spacing.lg
		},
		icon: {
			position: 'absolute',
			left: css.spacing.md,
			top: '50%',
			transform: 'translate(-25%, -50%)',
			pointerEvents: 'none',
			opacity: '0.6'
		}
	});
</script>

<script lang="ts">
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { cx } from '@emotion/css';

	interface Props extends StandardAttributeProps {
		/** Input type (text, search, email, etc.) */
		type?: 'text' | 'search' | 'email' | 'password' | 'number';

		/** The name of the form element. Used to identify the field when the input is
		 * submitted as part of a form. */
		name?: string;

		/** Current input value */
		value?: string;

		/** Placeholder text */
		placeholder?: string;

		/** Optional SVG icon source displayed before the input */
		icon?: string;

		/** Whether to auto-focus on mount */
		autofocus?: boolean;

		/** Accessible label for screen readers */
		'aria-label'?: string;

		/** Called when input value changes */
		oninput?: (e: Event & { currentTarget: HTMLInputElement }) => void;
	}

	let {
		type = 'text',
		name,
		value = $bindable(''),
		placeholder,
		icon,
		autofocus = false,
		'aria-label': ariaLabel,
		oninput,
		...attributes
	}: Props = $props();

	let inputElement: HTMLInputElement | undefined;

	export function focus() {
		inputElement?.focus();
	}
</script>

<span {...standardAttributes(attributes, styles.inputWrapper)}>
	{#if icon}
		<InlineSvg class={styles.icon} src={icon} />
	{/if}
	<input
		bind:this={inputElement}
		{type}
		{name}
		bind:value
		class={cx(styles.input, { [styles.inputWithIcon]: !!icon })}
		{placeholder}
		{autofocus}
		aria-label={ariaLabel}
		{oninput}
	/>
</span>
