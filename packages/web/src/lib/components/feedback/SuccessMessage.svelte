<script lang="ts" module>
	import * as css from '$lib/styles';
	import { keyframes } from '@emotion/css';

	const fadeOut = keyframes`
		0%,
		66% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	`;

	const styles = css.styles({
		successMessage: {
			...css.hpadding('md'),
			...css.vpadding('sm'),
			fontFamily: css.fonts.heading,
			color: css.text.positiveColor,
			fontWeight: 'bold',
			animation: `${fadeOut} 3s ease-out forwards`
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
		/** The success message to display */
		children: Snippet;
	}

	const { children, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, styles.successMessage)}>
	{@render children()}
</div>
