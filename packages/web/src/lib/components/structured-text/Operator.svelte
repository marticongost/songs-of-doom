<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		operator: {
			fontWeight: 'bold',
			color: css.text.subtleColor
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

<span {...standardAttributes(attributes, styles.operator)}>
	{@render children()}
</span>
