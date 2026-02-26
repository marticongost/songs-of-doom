<!--
@component
Displays a single focus token: an icon and its numeric pip value.
-->
<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { focuses, type Focus, type FocusType } from '@songsofdoom/game';
	import FocusIcon from './FocusIcon.svelte';

	interface Props extends StandardAttributeProps {
		/** The type of focus */
		focus: Focus | FocusType;
		/** The pip value of the token */
		value: number;
	}

	const { focus, value, ...attributes }: Props = $props();

	const focusObject = $derived(typeof focus === 'string' ? focuses[focus] : focus);
</script>

<span {...standardAttributes(attributes, 'focus-token')} data-focus={focusObject.type}>
	<FocusIcon focus={focusObject} framed={false} />
	<span class="focus-value">{value}</span>
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.focus-token {
		display: inline-flex;
		gap: rz.size(xs);
		align-items: center;
		justify-content: center;
		border: 2px solid currentColor;
		border-radius: rz.size(sm);
		background-color: white;
		width: 2.5em;
		height: 2.5em;

		@each $focus in strength, agility, intelligence, charisma, will, health, sanity, heroism, any {
			&[data-focus='#{$focus}'] {
				color: var(--focus-#{$focus}-color);
			}
		}
	}

	.focus-value {
		font-weight: bold;
		font-family: var(--number-font);
		font-size: 1.2em;
	}
</style>
