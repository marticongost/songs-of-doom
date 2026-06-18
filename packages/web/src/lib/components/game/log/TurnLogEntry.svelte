<!--
	@component Renders a Turn journal entry — which turn number.
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
	import type { TurnState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: TurnState;
	}

	const { state, ...attributes }: Props = $props();
	const turn = $derived(state.game.turn + 1);
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	<Text ca="Torn %(n)" es="Turno %(n)" en="Turn %(n)" n={turn} />
</div>
