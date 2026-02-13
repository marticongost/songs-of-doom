<!--
	@component
	A transparent button containing an icon. Combines Button with InlineSvg
	for icon-only actions with hover state color changes.
-->
<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';

	interface Props extends StandardAttributeProps {
		/** The icon source path (passed to InlineSvg) */
		src: string;

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
	}

	const {
		src,
		type = 'button',
		disabled = false,
		onclick,
		href,
		popovertarget,
		popovertargetaction,
		anchor,
		...attributes
	}: Props = $props();
</script>

<Button
	{...standardAttributes(attributes, 'icon-button')}
	appearance="transparent"
	{type}
	{disabled}
	{onclick}
	{href}
	{popovertarget}
	{popovertargetaction}
	{anchor}
>
	<InlineSvg {src} />
</Button>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	:global(.button.icon-button) {
		@include rz.padding(xs);
		border-radius: rz.size(sm);
		color: var(--icon-button-color, currentColor);
		cursor: pointer;

		&:hover:not(:disabled) {
			color: var(--icon-button-hover-color, var(--accent-color));
		}
	}
</style>
