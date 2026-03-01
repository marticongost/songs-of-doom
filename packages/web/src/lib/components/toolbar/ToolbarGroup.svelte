<!--
@component
Groups related toolbar elements together and renders a thin vertical separator after the
group if it is followed by any other element in the toolbar.
-->
<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { Snippet } from 'svelte';

	interface Props extends StandardAttributeProps {
		/** The toolbar elements to group together. */
		children: Snippet;
	}

	const { children, ...rest }: Props = $props();
</script>

<div {...standardAttributes(rest, 'toolbar-group')}>
	{@render children()}
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.toolbar-group {
		@include rz.row;
		border-left: 1px dotted var(--toolbar-separator-color);
		border-right: 1px dotted var(--toolbar-separator-color);
	}

	.toolbar-group :global(+ .toolbar-group) {
		border-left: none;
	}
</style>
