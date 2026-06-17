<!--
	@component Renders an ExhaustEffect journal entry.
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
	import type { ExhaustEffectState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: ExhaustEffectState;
	}

	const { state: _state, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	<Text ca="Esgotant carta" es="Agotando carta" en="Exhausting card" />
</div>
