<!--
	@component Renders a TurnsPhase journal entry.
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
	import type { TurnsPhaseState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: TurnsPhaseState;
	}

	const { state: _state, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	<Text ca="Fase de torns" es="Fase de turnos" en="Turns phase" />
</div>
