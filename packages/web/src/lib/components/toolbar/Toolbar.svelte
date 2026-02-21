<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { Snippet } from 'svelte';

	interface Props extends StandardAttributeProps {
		children: Snippet;
	}

	const { children, ...rest }: Props = $props();
</script>

<div {...standardAttributes(rest, 'toolbar')}>
	{@render children()}
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.toolbar {
		@include rz.row;
		background-color: var(--toolbar-background-color);
		border: var(--toolbar-border);
		border-radius: rz.size(sm);
	}
</style>
