<script lang="ts" context="module">
	let idCounter = 0;
</script>

<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { LocalisedText } from '@songsofdoom/common';
	import type { Snippet } from 'svelte';
	import InlineSvg from '../InlineSvg.svelte';
	import Text from '../localisation/Text.svelte';
	import Popover from '../Popover.svelte';

	interface Props extends StandardAttributeProps {
		icon: string;
		label: LocalisedText;
		disabled?: boolean;
		href?: string;
		onclick?: (e: MouseEvent) => void;
		anchor?: string;
		/** Snippet to display in a popover when the button is disabled */
		disabledReason?: Snippet;
	}

	const { icon, label, disabled, href, onclick, anchor, disabledReason, ...rest }: Props = $props();

	// Generate unique ID for popover if disabled reason is provided
	const popoverId = $derived(
		disabled && disabledReason ? `toolbar-button-popover-${++idCounter}` : undefined
	);
	const anchorName = $derived(anchor ?? (popoverId ? `--${popoverId}` : undefined));

	// Conditional event handlers for popover interaction
	const popoverHandlers = $derived(
		popoverId
			? {
					onmouseenter: () => document.getElementById(popoverId)?.showPopover(),
					onmouseleave: () => document.getElementById(popoverId)?.hidePopover()
				}
			: {}
	);
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	{href}
	{onclick}
	target={href ? '_blank' : undefined}
	{...standardAttributes(rest, 'toolbar-button')}
	{disabled}
	style:anchor-name={anchorName}
	{...popoverHandlers}
>
	<InlineSvg src={icon} />
	<span class="label"><Text {...label} /></span>
</svelte:element>

{#if disabled && disabledReason}
	<Popover
		id={popoverId!}
		class="impediment-popover"
		anchor={anchorName}
		mode="manual"
		position="top"
		{...popoverHandlers}
	>
		{@render disabledReason()}
	</Popover>
{/if}

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.toolbar-button {
		@include rz.column(sm);
		@include rz.padding(md);
		--svg-height: 1.5em;
		--svg-width: auto;
		color: var(--toolbar-button-color);
		font-weight: bold;

		:global(svg) {
			transition: transform 0.1s linear;
			opacity: 0.6;
			filter: grayscale(20%) drop-shadow(0 0 0.1em black);
		}

		&[disabled] {
			opacity: 0.5;
			cursor: not-allowed;
		}

		&:hover {
			background-color: var(--toolbar-button-hover-background-color);
			color: var(--toolbar-button-hover-color);

			:global(svg) {
				transform: scale(1.2);
			}
		}

		&:focus {
			outline: none;
			background-color: var(--toolbar-button-focus-background-color);
			color: var(--toolbar-button-focus-color);
		}
	}

	:global(.impediment-popover) {
		min-width: 12em;
	}
</style>
