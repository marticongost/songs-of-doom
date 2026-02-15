<script lang="ts">
	import type { Snippet } from 'svelte';
	import { standardAttributes, type StandardAttributeProps } from './standardattributes';

	interface Props extends StandardAttributeProps {
		children: Snippet;
	}

	const { children, ...attributes }: Props = $props();
</script>

<blockquote {...standardAttributes(attributes, 'block-quote')}>
	{@render children()}
</blockquote>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	blockquote {
		margin: 0;
		margin-top: rz.size(sm);
		@include rz.vpadding(xs);
		padding-left: rz.size(md);
		border-left: 4px solid rgba(white, 0.1);
		background-color: rgba(white, 0.05);
	}
</style>
