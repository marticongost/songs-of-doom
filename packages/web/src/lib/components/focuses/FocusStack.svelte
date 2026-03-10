<!--
@component
Displays a stack of focus tokens of a given size, with a FocusToken at the top
and backing tokens below to suggest depth.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		focusStack: {
			display: 'inline-flex',
			flexDirection: 'column',
			alignItems: 'stretch',
			...css.colorBindings.focus.rules('data-focus', (color) => ({ color }))
		},
		backingToken: {
			height: css.spacing.xs,
			backgroundColor: 'currentColor',
			opacity: '0.4',
			borderRadius: `0 0 ${css.spacing.xs} ${css.spacing.xs}`
		}
	});
</script>

<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { focuses, type Focus, type FocusType } from '@songsofdoom/game';
	import FocusToken from './FocusToken.svelte';

	interface Props extends StandardAttributeProps {
		/** The type of focus */
		focus: Focus | FocusType;
		/** The pip value of each token in the stack */
		value: number;
		/** The number of tokens to stack */
		size: number;
	}

	const { focus, value, size, ...attributes }: Props = $props();

	const focusObject = $derived(typeof focus === 'string' ? focuses[focus] : focus);
	const backingCount = $derived(Math.max(0, size - 1));
</script>

<div {...standardAttributes(attributes, styles.focusStack)} data-focus={focusObject.type}>
	<FocusToken {focus} {value} />
	{#each { length: backingCount } as _, i (i)}
		<span class={styles.backingToken} aria-hidden="true"></span>
	{/each}
</div>
