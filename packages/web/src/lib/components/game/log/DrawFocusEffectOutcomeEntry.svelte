<!--
	@component Renders the outcome of a DrawFocusEffect procedure —
	what tokens each player drew.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		focusDraw: {
			display: 'inline-flex',
			alignItems: 'center',
			gap: css.spacing.sm
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
			width: '0.9em',
			height: '0.9em',
			borderRadius: '25%',
			fontWeight: 'bold',
			font: css.fonts.number,
			color: css.text.lightBackgroundColor,
			backgroundColor: 'white'
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
	import type { DrawFocusState } from '@songsofdoom/engine';
	import { focusTypes, makeFocusToken, type FocusValue } from '@songsofdoom/game';

	interface Props extends StandardAttributeProps {
		state: DrawFocusState;
	}

	const { state, ...attributes }: Props = $props();
	const playerDrawnTokens = $derived(state.playerDrawnTokens);
</script>

{#if playerDrawnTokens}
	<div {...standardAttributes(attributes, styles.entry)}>
		{#each [...playerDrawnTokens.entries()] as [playerId, counter] (playerId)}
			{state.game.requirePlayer(playerId).character.name}
			<div class={styles.focusDraw}>
				{#each focusTypes as focusType (focusType)}
					{#if focusValues.some((focusValue) => counter.get(makeFocusToken(focusType, focusValue)) > 0)}
						<span class={styles.focusType}>
							<FocusIcon focus={focusType} framed={false} />
							{#each focusValues as focusValue (focusValue)}
								{@const token = makeFocusToken(focusType, focusValue)}
								{#each { length: counter.get(token) } as _, i (i)}
									<span class={styles.focusValue}>{focusValue}</span>
								{/each}
							{/each}
						</span>
					{/if}
				{/each}
			</div>
		{/each}
	</div>
{/if}
