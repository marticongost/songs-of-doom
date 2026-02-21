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
	}

	const { icon, label, disabled, ...rest }: Props = $props();
</script>

<button type="button" {...standardAttributes(rest, 'toolbar-button')} {disabled}>
	<InlineSvg src={icon} />
	<span class="label"><Text {...label} /></span>
</button>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.toolbar-button {
		@include rz.column(xs);
		@include rz.padding(md);
		--svg-color: var(--toolbar-button-icon-color);
		--svg-height: 1.7em;
		--svg-width: auto;
		color: var(--toolbar-button-text-color);
		font-weight: bold;

		:global(svg) {
			transition: transform 0.1s linear;
		}

		&[disabled] {
			opacity: 0.5;
			cursor: not-allowed;
		}

		&:hover {
			background-color: var(--toolbar-button-hover-background-color);
			color: var(--toolbar-button-hover-text-color);
			--svg-color: var(--toolbar-button-hover-icon-color);

			:global(svg) {
				transform: scale(1.2);
			}
		}
	}
</style>
