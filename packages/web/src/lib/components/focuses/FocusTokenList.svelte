<!--
	@component Renders a list of focus tokens grouped by focus type,
	showing icons and value badges.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		focusDraw: {
			display: 'inline-flex',
			alignItems: 'center',
			gap: css.spacing.md
		},
		focusType: {
			display: 'inline-flex',
			alignItems: 'center',
			gap: css.spacing.xs
		},
		focusValue: {
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center',
			lineHeight: 0,
			width: '1.2em',
			height: '1.2em',
			borderRadius: '25%',
			fontSize: '0.8em',
			fontWeight: 'bold',
			fontFamily: css.fonts.number,
			color: css.text.regularColor,
			textShadow: '0 0 0.1em rgba(0, 0, 0, 0.8)',
			...css.colorBindings.focus.rules('data-focus', (color) => ({
				backgroundColor: color
			}))
		}
	});
	const focusValues = [3, 2, 1] as FocusValue[];
</script>

<script lang="ts">
	import FocusIcon from '$lib/components/focuses/FocusIcon.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { ReadonlyCounter } from '@songsofdoom/common';
	import { focusTypes, makeFocusToken, type FocusToken, type FocusValue } from '@songsofdoom/game';

	interface Props extends StandardAttributeProps {
		tokens: ReadonlyCounter<FocusToken>;
	}

	const { tokens, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, styles.focusDraw)}>
	{#each focusTypes as focusType (focusType)}
		{#if focusValues.some((focusValue) => tokens.get(makeFocusToken(focusType, focusValue)) > 0)}
			<span class={styles.focusType}>
				<FocusIcon focus={focusType} framed={false} />
				{#each focusValues as focusValue (focusValue)}
					{@const token = makeFocusToken(focusType, focusValue)}
					{#each { length: tokens.get(token) } as _, i (i)}
						<span class={styles.focusValue} data-focus={focusType}>{focusValue}</span>
					{/each}
				{/each}
			</span>
		{/if}
	{/each}
</div>
