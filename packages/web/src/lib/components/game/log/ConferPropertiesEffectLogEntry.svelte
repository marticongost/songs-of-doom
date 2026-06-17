<!--
	@component Renders a ConferPropertiesEffect journal entry.
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
	import type { ConferPropertiesEffectState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: ConferPropertiesEffectState;
	}

	const { state: _state, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	<Text ca="Conferint propietats" es="Confiriendo propiedades" en="Conferring properties" />
</div>
