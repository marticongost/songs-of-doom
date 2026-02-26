<!--
@component
Displays a stack of focus tokens of a given size, with a FocusToken at the top
and backing tokens below to suggest depth.
-->
<script lang="ts">
	import { focuses, type Focus, type FocusType } from '@songsofdoom/game';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
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

<div {...standardAttributes(attributes, 'focus-stack')} data-focus={focusObject.type}>
	<FocusToken {focus} {value} />
	{#each { length: backingCount } as _, i (i)}
		<span class="backing-token" aria-hidden="true"></span>
	{/each}
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.focus-stack {
		display: inline-flex;
		flex-direction: column;
		align-items: stretch;

		@each $focus in strength, agility, intelligence, charisma, will, health, sanity, heroism, any {
			&[data-focus='#{$focus}'] {
				color: var(--focus-#{$focus}-color);
			}
		}
	}

	.backing-token {
		height: rz.size(xs);
		background-color: currentColor;
		opacity: 0.4;
		border-radius: 0 0 rz.size(xs) rz.size(xs);
	}
</style>
