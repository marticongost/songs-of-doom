<!--
	@component
	A popover component using the HTML5 Popover API and CSS anchor positioning.

	Use with a Button that has `popovertarget` set to this popover's `id` and
	`anchor` set to match this popover's `anchor` prop.

	```svelte
	<Button popovertarget="my-popover" anchor="--my-anchor">Open</Button>
	<Popover id="my-popover" anchor="--my-anchor">
		Popover content here
	</Popover>
	```
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		popover: {
			padding: css.spacing.md,
			position: 'fixed',
			margin: '0',
			background: css.palette.black,
			border: `2px solid ${css.palette.darkSteel}`,
			borderRadius: css.spacing.sm,
			boxShadow: `0 0 ${css.spacing.md} rgba(0, 0, 0, 0.5)`,
			color: 'inherit',
			'&::backdrop': {
				background: 'transparent'
			},
			"&[data-position='top']": {
				top: `-${css.spacing.sm}`
			},
			"&[data-position='bottom']": {
				top: css.spacing.sm
			},
			"&[data-position='left']": {
				left: `-${css.spacing.sm}`
			},
			"&[data-position='right']": {
				left: css.spacing.sm
			}
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
		/** Unique identifier for the popover (used by popovertarget) */
		id: string;

		/** CSS anchor name for positioning (defaults to --{id}) */
		anchor?: string;

		/** Position relative to the anchor element */
		position?: 'top' | 'bottom' | 'left' | 'right';

		/** Popover mode: 'auto' closes when clicking outside, 'manual' requires explicit close */
		mode?: 'auto' | 'manual';

		/** Popover content */
		children: Snippet;
	}

	const {
		id,
		anchor,
		position = 'bottom',
		mode = 'auto',
		children,
		...attributes
	}: Props = $props();

	const resolvedAnchor = $derived(anchor ?? `--${id}`);

	const positionArea = $derived(
		{
			top: 'block-start center',
			bottom: 'block-end center',
			left: 'center inline-start',
			right: 'center inline-end'
		}[position]
	);
</script>

<div
	{...standardAttributes(attributes, styles.popover)}
	{id}
	popover={mode}
	style:position-anchor={resolvedAnchor}
	style:position-area={positionArea}
	data-position={position}
>
	{@render children()}
</div>
