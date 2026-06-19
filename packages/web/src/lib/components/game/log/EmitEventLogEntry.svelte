<!--
	@component Renders an EmitEvent journal entry.
	Shows the event name when available, otherwise a generic label.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		entry: {
			color: css.text.highlightColor
		}
	});
</script>

<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { EmitEventState } from '@songsofdoom/engine';
	import { events } from '@songsofdoom/game';

	interface Props extends StandardAttributeProps {
		state: EmitEventState;
	}

	const { state, ...attributes }: Props = $props();
	const event = $derived(state.eventType ? events[state.eventType] : undefined);
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	{#if event}
		<Text {...event.name} />
	{:else if state.step === 'askPlayersForNextReaction'}
		<Text ca="Selecció de reacció" es="Selección de reacción" en="Reaction selection" />
	{:else}
		<Text ca="Processant reaccions" es="Procesando reacciones" en="Processing reactions" />
	{/if}
</div>
