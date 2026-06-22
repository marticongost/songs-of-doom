<!--
	@component Renders a PlaceLocationEffect journal entry.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		entry: {}
	});
</script>

<script lang="ts">
	import PlaceLocationEffectChip from '$lib/components/effects/PlaceLocationEffectChip.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { PlaceLocationEffectState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: PlaceLocationEffectState;
	}

	const { state, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	<PlaceLocationEffectChip effect={state.effect} />
</div>
