<!--
	@component Renders a TurnCreatureActionsPhase journal entry.
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
	import type { TurnCreatureActionsPhaseState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: TurnCreatureActionsPhaseState;
	}

	const { state: _state, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	<Text ca="Accions de les criatures" es="Acciones de las criaturas" en="Creature actions" />
</div>
