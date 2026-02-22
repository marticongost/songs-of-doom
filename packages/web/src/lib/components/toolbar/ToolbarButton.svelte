<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { LocalisedText } from '@songsofdoom/common';
	import InlineSvg from '../InlineSvg.svelte';
	import Text from '../localisation/Text.svelte';

	interface Props extends StandardAttributeProps {
		icon: string;
		label: LocalisedText;
		disabled?: boolean;
		href?: string;
		onclick?: (e: MouseEvent) => void;
	}

	const { icon, label, disabled, href, onclick, ...rest }: Props = $props();
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	{href}
	{onclick}
	target={href ? '_blank' : undefined}
	{...standardAttributes(rest, 'toolbar-button')}
	{disabled}
>
	<InlineSvg src={icon} />
	<span class="label"><Text {...label} /></span>
</svelte:element>

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
	}
</style>
