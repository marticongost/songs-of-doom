<!--
	@component Renders a NarrationEffect journal entry as an ellided fragment.

	Shows the first few words of the narration text in quotes, followed by
	an ellipsis. Clicking the entry opens the {@link NarrationPopup} which
	displays the full narration with navigation controls.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const ELLIPSIS_LENGTH = 40;

	const styles = css.styles({
		root: {
			cursor: 'pointer',
			fontStyle: 'italic',
			fontFamily: css.fonts.heading,
			color: css.palette.silk,
			background: 'none',
			border: 'none',
			padding: 0,
			textAlign: 'left',

			'&:hover': {
				color: css.palette.gold
			}
		}
	});

	function ellide(text: string): string {
		if (text.length <= ELLIPSIS_LENGTH) return `"${text}"`;
		return `"${text.slice(0, ELLIPSIS_LENGTH)}…"`;
	}
</script>

<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { getLocale } from '$lib/context/locale';
	import { translate } from '@songsofdoom/common/localisation';
	import type { NarrationEffectState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: NarrationEffectState;
		/** Called when the entry is clicked. */
		onclick?: () => void;
	}

	const { state, onclick, ...attributes }: Props = $props();

	const locale = getLocale();

	const firstParagraph = $derived(
		translate(state.effect.text, locale)
			.split(/\n+/)
			.find((p) => p.trim().length > 0) ?? ''
	);
</script>

<button {...standardAttributes(attributes, styles.root)} {onclick} type="button">
	{ellide(firstParagraph)}
</button>
