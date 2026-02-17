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
	{...standardAttributes(attributes, 'popover')}
	{id}
	popover={mode}
	style:position-anchor={resolvedAnchor}
	style:position-area={positionArea}
	data-position={position}
>
	{@render children()}
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.popover {
		@include rz.padding(md);
		position: fixed;
		margin: 0;
		background: var(--popover-background);
		border: var(--popover-border);
		border-radius: rz.size(sm);
		box-shadow: 0 0 rz.size(md) rgba(black, 0.5);
		color: inherit;

		&::backdrop {
			background: transparent;
		}

		&[data-position='top'] {
			top: -#{rz.size(sm)};
		}

		&[data-position='bottom'] {
			top: rz.size(sm);
		}

		&[data-position='left'] {
			left: -#{rz.size(sm)};
		}

		&[data-position='right'] {
			left: rz.size(sm);
		}
	}
</style>
