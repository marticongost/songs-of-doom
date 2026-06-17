<!--
	@component Renders a TriggerCapability journal entry — who used what capability.
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
	import type { TriggerCapabilityState } from '@songsofdoom/engine';
	import { Action, Reaction } from '@songsofdoom/game';

	interface Props extends StandardAttributeProps {
		state: TriggerCapabilityState;
	}

	const { state, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	{#if state.capability instanceof Action}
		<Text ca="Executant acció" es="Ejecutando acción" en="Executing action" />
	{:else if state.capability instanceof Reaction}
		<Text ca="Executant reacció" es="Ejecutando reacción" en="Executing reaction" />
	{:else}
		<Text ca="Activant capacitat" es="Activando capacidad" en="Triggering capability" />
	{/if}
</div>
