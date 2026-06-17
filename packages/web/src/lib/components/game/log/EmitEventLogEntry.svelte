<!--
	@component Renders an EmitEvent journal entry — what event was emitted.
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

	const event = $derived(events[state.eventType!]);
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	<Text {...event.name} />
</div>
