<!--
@component
A blockquote used to display examples, with a darker background and italic text.

```svelte
<Example>
	This is an example of how something works.
</Example>
```
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		example: {
			margin: 0,
			marginTop: css.spacing.sm,
			padding: css.spacing.sm,
			paddingLeft: css.spacing.md,
			borderLeft: '4px solid rgba(255, 255, 255, 0.15)',
			backgroundColor: 'rgba(255, 255, 255, 0.1)',
			fontStyle: 'italic'
		}
	});
</script>

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

<blockquote {...standardAttributes(attributes, styles.example)}>
	{@render children()}
</blockquote>
