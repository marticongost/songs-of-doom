<!--
	@component Renders a TurnEndPhase journal entry — turn ends.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		entry: {}
	});
</script>

<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { TurnEndPhaseState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: TurnEndPhaseState;
	}

	const { state, ...attributes }: Props = $props();
	const turn = $derived(state.game.turn);
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	<Text ca="Fi del torn %(n)" es="Fin del turno %(n)" en="Turn %(n) ends" n={turn} />
</div>
