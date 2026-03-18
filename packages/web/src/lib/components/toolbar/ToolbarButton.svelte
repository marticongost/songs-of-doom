<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		toolbarButton: {
			...css.column('sm'),
			padding: css.spacing.md,
			'--svg-height': '1.5em',
			'--svg-width': 'auto',
			color: css.palette.opium,
			fontWeight: 'bold',
			svg: {
				transition: 'transform 0.1s linear',
				opacity: '0.6',
				filter: 'grayscale(20%) drop-shadow(0 0 0.1em black)'
			},
			'&[disabled]': {
				opacity: '0.5',
				cursor: 'not-allowed'
			},
			'&:hover': {
				backgroundColor: css.palette.extraLightCocoaBrown,
				color: css.palette.dustyGray,
				svg: {
					transform: 'scale(1.2)'
				}
			},
			'&:focus': {
				outline: 'none',
				backgroundColor: css.palette.cocoaBrown,
				color: css.palette.dustyGray
			}
		},
		orbitContainer: {
			position: 'absolute',
			inset: '0',
			pointerEvents: 'none',
			'--orbit-radius': '1.3em',
			animation: 'spin 1s linear infinite'
		},
		iconContainer: {
			position: 'relative',
			display: 'grid',
			placeItems: 'center',
			width: '1.5em',
			height: '1.5em',
			marginInline: 'auto',
			svg: {
				width: '100%',
				height: '100%'
			}
		},
		dot: {
			position: 'absolute',
			top: '50%',
			left: '50%',
			'--arc-turn': '0.5turn',
			'--arc-start': '-0.25turn',
			'--max-dot-size': '0.35em',
			'--dot-size-factor': 'calc((var(--dot-index) + 1) / var(--dot-count))',
			'--dot-angle':
				'calc(var(--arc-start) + var(--arc-turn) * var(--dot-index) / (var(--dot-count) - 1))',
			'--dot-size': 'calc(var(--max-dot-size) * var(--dot-size-factor))',
			width: 'var(--dot-size)',
			height: 'var(--dot-size)',
			backgroundColor: 'currentColor',
			borderRadius: '50%',
			opacity: '0.85',
			transform: 'translate(-50%, -50%) rotate(var(--dot-angle)) translateX(var(--orbit-radius))'
		},
		impedimentPopover: {
			minWidth: '12em'
		}
	});
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
	{...standardAttributes(rest, styles.toolbarButton)}
	disabled={isDisabled}
	style:anchor-name={anchorName}
	{...popoverHandlers}
>
	<div class={styles.iconContainer}>
		<InlineSvg src={icon} />
		{#if busy}
			<div
				class={styles.orbitContainer}
				style:--dot-count={busyDotIndices.length}
				aria-hidden="true"
			>
				{#each busyDotIndices as i (i)}
					<span class={styles.dot} style:--dot-index={i}></span>
				{/each}
			</div>
		{/if}
	</div>
	<span class="label"><Text {...label} /></span>
</svelte:element>

{#if disabled && disabledReason}
	<Popover
		id={popoverId!}
		class={styles.impedimentPopover}
		anchor={anchorName}
		mode="manual"
		position="top"
		{...popoverHandlers}
	>
		{@render disabledReason()}
	</Popover>
{/if}
