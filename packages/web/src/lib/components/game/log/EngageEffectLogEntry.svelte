<!--
	@component Renders an EngageEffect journal entry.
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
	import type { EngageEffectState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: EngageEffectState;
	}

	const { state: _state, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	<Text ca="Enfrontant-se" es="Enfrentándose" en="Engaging" />
</div>
