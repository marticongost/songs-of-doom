<!--
@component
Displays a single focus token with 1–3 icons arranged by pip value:
- Value 1: single icon, centered
- Value 2: two icons, upper-left and lower-right corners
- Value 3: three icons in an upward-facing triangle
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		focusToken: {
			position: 'relative',
			display: 'inline-block',
			border: '2px solid currentColor',
			borderRadius: css.spacing.sm,
			backgroundColor: 'white',
			backgroundImage: 'radial-gradient(circle at center, transparent 70%, currentColor)',
			width: '2.7em',
			height: '2.7em',
			...css.colorBindings.focus.rules('data-focus', (color) => ({ color })),
			"&[data-value='1'] [data-slot]": {
				fontSize: '1em',
				left: '50%',
				top: '50%'
			},
			"&[data-value='2']": {
				'[data-slot]': {
					fontSize: '0.9em'
				},
				"[data-slot='1']": {
					left: '32%',
					top: '32%'
				},
				"[data-slot='2']": {
					left: '68%',
					top: '68%'
				}
			},
			"&[data-value='3']": {
				'[data-slot]': {
					fontSize: '0.8em'
				},
				"[data-slot='1']": {
					left: '50%',
					top: '26%'
				},
				"[data-slot='2']": {
					left: '25%',
					top: '74%'
				},
				"[data-slot='3']": {
					left: '75%',
					top: '74%'
				}
			}
		},
		iconSlot: {
			position: 'absolute',
			transform: 'translate(-50%, -50%)',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center'
		}
	});
</script>

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
	{...standardAttributes(attributes, styles.focusToken)}
	data-focus={focusObject.type}
	data-value={value}
>
	{#each slots as slot (slot)}
		<span class={styles.iconSlot} data-slot={slot}>
			<FocusIcon focus={focusObject} framed={false} />
		</span>
	{/each}
</span>
