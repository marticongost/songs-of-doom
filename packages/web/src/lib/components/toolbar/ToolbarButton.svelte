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
		/** Shows an orbiting dots animation and disables the button */
		busy?: boolean;
		href?: string;
		onclick?: (e: MouseEvent) => void;
		anchor?: string;
		target?: string;
		/** Snippet to display in a popover when the button is disabled */
		disabledReason?: Snippet;
	}

	const {
		icon,
		label,
		disabled,
		busy,
		href,
		onclick,
		anchor,
		target,
		disabledReason,
		...rest
	}: Props = $props();

	const busyDotIndices = Array.from({ length: 5 }, (_, index) => index);

	const isDisabled = $derived(disabled || busy);

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
	target={href ? target : undefined}
	{...standardAttributes(rest, 'toolbar-button')}
	disabled={isDisabled}
	style:anchor-name={anchorName}
	{...popoverHandlers}
>
	<div class="icon-container">
		<InlineSvg src={icon} />
		{#if busy}
			<div class="orbit-container" style:--dot-count={busyDotIndices.length} aria-hidden="true">
				{#each busyDotIndices as i (i)}
					<span class="dot" style:--dot-index={i}></span>
				{/each}
			</div>
		{/if}
	</div>
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

	.orbit-container {
		position: absolute;
		inset: 0;
		pointer-events: none;
		--orbit-radius: 1.3em;
		animation: spin 1s linear infinite;
	}

	.icon-container {
		position: relative;
		display: grid;
		place-items: center;
		width: 1.5em;
		height: 1.5em;
		margin-inline: auto;

		:global(svg) {
			width: 100%;
			height: 100%;
		}
	}

	.dot {
		position: absolute;
		top: 50%;
		left: 50%;
		--arc-turn: 0.5turn;
		--arc-start: -0.25turn;
		--max-dot-size: 0.35em;
		--dot-size-factor: calc((var(--dot-index) + 1) / var(--dot-count));
		--dot-angle: calc(
			var(--arc-start) + var(--arc-turn) * var(--dot-index) / (var(--dot-count) - 1)
		);
		--dot-size: calc(var(--max-dot-size) * var(--dot-size-factor));
		width: var(--dot-size);
		height: var(--dot-size);
		background-color: currentColor;
		border-radius: 50%;
		opacity: 0.85;
		transform: translate(-50%, -50%) rotate(var(--dot-angle)) translateX(var(--orbit-radius));
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	:global(.impediment-popover) {
		min-width: 12em;
	}
</style>
