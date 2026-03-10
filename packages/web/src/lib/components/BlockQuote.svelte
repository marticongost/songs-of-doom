<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		blockQuote: {
			margin: 0,
			marginTop: css.spacing.sm,
			...css.vpadding('xs'),
			paddingLeft: css.spacing.md,
			borderLeft: `4px solid rgba(255, 255, 255, 0.1)`,
			backgroundColor: `rgba(255, 255, 255, 0.05)`
		}
	});
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { standardAttributes, type StandardAttributeProps } from './standardattributes';

	interface Props extends StandardAttributeProps {
		children: Snippet;
	}

	const { children, ...attributes }: Props = $props();
</script>

<blockquote {...standardAttributes(attributes, styles.blockQuote)}>
	{@render children()}
</blockquote>
