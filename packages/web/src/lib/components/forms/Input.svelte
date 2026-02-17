<!--
@component
A styled text input with optional leading icon.

@example
```svelte
<Input type="text" placeholder="Enter text..." bind:value />
```
-->
<script lang="ts">
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';

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
</script>

<span {...standardAttributes(attributes, 'input-wrapper')} class:has-icon={!!icon}>
	{#if icon}
		<InlineSvg class="input-icon" src={icon} />
	{/if}
	<input {type} {name} bind:value {placeholder} {autofocus} aria-label={ariaLabel} {oninput} />
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.input-wrapper {
		position: relative;
		display: inline-block;

		input {
			width: 100%;
			height: var(--input-height);
			padding: rz.size(sm) rz.size(md);
			font-family: inherit;
			font-size: inherit;
			color: var(--text-color);
			background-color: var(--input-background-color);
			border: var(--input-border);
			border-radius: rz.size(sm);

			&:focus {
				border: var(--focus-outline);
				outline: none;
			}

			&::placeholder {
				color: inherit;
				opacity: 0.6;
			}
		}

		&.has-icon {
			:global(.input-icon) {
				position: absolute;
				left: calc(rz.size(lg) / 2);
				top: 50%;
				transform: translate(-25%, -50%);
				pointer-events: none;
				opacity: 0.6;
			}

			input {
				padding-left: rz.size(lg);
			}
		}
	}
</style>
