<!--
@component
Displays a single focus token with 1–3 icons arranged by pip value:
- Value 1: single icon, centered
- Value 2: two icons, upper-left and lower-right corners
- Value 3: three icons in an upward-facing triangle
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
		/** The pip value of the token (1–3) */
		value: number;
	}

	const { focus, value, ...attributes }: Props = $props();

	const focusObject = $derived(typeof focus === 'string' ? focuses[focus] : focus);
	const slots = $derived(Array.from({ length: value }, (_, i) => i + 1));
</script>

<span
	{...standardAttributes(attributes, 'focus-token')}
	data-focus={focusObject.type}
	data-value={value}
>
	{#each slots as slot (slot)}
		<span class="icon-slot" data-slot={slot}>
			<FocusIcon focus={focusObject} framed={false} />
		</span>
	{/each}
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.focus-token {
		position: relative;
		display: inline-block;
		border: 2px solid currentColor;
		border-radius: rz.size(sm);
		background-color: white;
		background-image: radial-gradient(circle at center, transparent 70%, currentColor);
		width: 2.7em;
		height: 2.7em;

		@each $focus in strength, agility, intelligence, charisma, will, health, sanity, heroism, any {
			&[data-focus='#{$focus}'] {
				color: var(--focus-#{$focus}-color);
			}
		}

		// Value 1: single icon, centered
		&[data-value='1'] .icon-slot {
			font-size: 1em;
			left: 50%;
			top: 50%;
		}

		// Value 2: upper-left and lower-right corners
		&[data-value='2'] {
			.icon-slot {
				font-size: 0.9em;
			}

			.icon-slot[data-slot='1'] {
				left: 32%;
				top: 32%;
			}

			.icon-slot[data-slot='2'] {
				left: 68%;
				top: 68%;
			}
		}

		// Value 3: upward-facing triangle (apex at top-center, base at bottom corners)
		&[data-value='3'] {
			.icon-slot {
				font-size: 0.8em;
			}

			.icon-slot[data-slot='1'] {
				left: 50%;
				top: 26%;
			}

			.icon-slot[data-slot='2'] {
				left: 25%;
				top: 74%;
			}

			.icon-slot[data-slot='3'] {
				left: 75%;
				top: 74%;
			}
		}
	}

	.icon-slot {
		position: absolute;
		transform: translate(-50%, -50%);
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
