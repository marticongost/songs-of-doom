<!--
	@component Renders the outcome of a DrawFocusEffect procedure —
	what tokens each player drew.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		playerEntry: {
			display: 'inline-flex',
			alignItems: 'center',
			gap: css.spacing.sm
		}
	});
</script>

<script lang="ts">
	import FocusTokenList from '$lib/components/focuses/FocusTokenList.svelte';
	import TextList from '$lib/components/localisation/TextList.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { DrawFocusState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: DrawFocusState;
	}

	const { state, ...attributes }: Props = $props();
	const playerDrawnTokens = $derived(state.playerDrawnTokens);
</script>

{#if playerDrawnTokens}
	<div {...standardAttributes(attributes)}>
		<TextList items={[...playerDrawnTokens.entries()]}>
			{#snippet entry([playerId, counter])}
				<span class={styles.playerEntry}>
					<span class={styles.playerName}>{state.game.requirePlayer(playerId).character.name}:</span
					>
					<FocusTokenList tokens={counter} />
				</span>
			{/snippet}
		</TextList>
	</div>
{/if}
