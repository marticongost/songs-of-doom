<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		variable: {
			fontWeight: 'bold',
			fontFamily: css.fonts.heading,
			color: css.palette.chatelle
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

<span {...standardAttributes(attributes, styles.variable)}>
	{@render children()}
</span>
