<!--
	@component Renders a TurnStartPhase journal entry — turn begins.
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
	import type { TurnStartPhaseState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: TurnStartPhaseState;
	}

	const { state: _state, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	<Text ca="Inici del torn" es="Inicio del turno" en="Start of turn" />
</div>
