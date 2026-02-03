<!--
@component
A blockquote used to display examples, with a darker background and italic text.

```svelte
<Example>
	This is an example of how something works.
</Example>
```
-->
<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { Snippet } from 'svelte';

	interface Props extends StandardAttributeProps {
		children: Snippet;
	}

	const { children, ...attributes }: Props = $props();
</script>

<blockquote {...standardAttributes(attributes, 'example')}>
	{@render children()}
</blockquote>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.example {
		margin: 0;
		margin-top: rz.size(sm);
		@include rz.padding(sm);
		padding-left: rz.size(md);
		border-left: 4px solid rgba(white, 0.15);
		background-color: rgba(white, 0.1);
		font-style: italic;
	}
</style>
