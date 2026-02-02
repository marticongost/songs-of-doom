<!--
@component
A styled anchor element.

```svelte
<Link href="/path">Click here</Link>
<Link href="#section">Jump to section</Link>
```
-->
<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { Snippet } from 'svelte';

	interface Props extends StandardAttributeProps {
		/** The URL or fragment to link to */
		href: string;
		children: Snippet;
	}

	const { href, children, ...attributes }: Props = $props();
</script>

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href is pre-resolved by the caller -->
<a {href} {...standardAttributes(attributes, 'link')}>{@render children()}</a>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.link {
		text-decoration: underline;
		color: var(--link-color);

		&:hover {
			color: var(--link-hover-color);
		}
	}
</style>
