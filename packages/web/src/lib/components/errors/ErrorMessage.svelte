<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { Snippet } from 'svelte';

	interface Props extends StandardAttributeProps {
		/** The error message to display */
		children: Snippet;
	}

	const { children, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, 'error-message')}>
	{@render children()}
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.error-message {
		@include rz.hpadding(md);
		@include rz.vpadding(sm);
		background-color: var(--negative-color);
	}
</style>
