<!--
	@component Renders a DrawFocusEffect journal entry.
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
	import type { DrawFocusState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: DrawFocusState;
	}

	const { state: _state, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	<Text ca="Robant fitxes d'enfocament" es="Robando fichas de enfoque" en="Drawing focus tokens" />
</div>
