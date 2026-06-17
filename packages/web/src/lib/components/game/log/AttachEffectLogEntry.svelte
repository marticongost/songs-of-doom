<!--
	@component Renders an AttachEffect journal entry.
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
	import type { AttachEffectProcedureState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: AttachEffectProcedureState;
	}

	const { state: _state, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	<Text ca="Adjuntant carta" es="Adjuntando carta" en="Attaching card" />
</div>
