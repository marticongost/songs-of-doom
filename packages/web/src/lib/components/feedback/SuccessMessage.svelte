<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { Snippet } from 'svelte';

	interface Props extends StandardAttributeProps {
		/** The success message to display */
		children: Snippet;
	}

	const { children, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, 'success-message')}>
	{@render children()}
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.success-message {
		@include rz.hpadding(md);
		@include rz.vpadding(sm);
		font-family: var(--heading-font);
		color: var(--positive-color);
		font-weight: bold;
		animation: fade-out 3s ease-out forwards;
	}

	@keyframes fade-out {
		0%,
		66% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}
</style>
