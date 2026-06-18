<!--
	@component Renders a Chapter journal entry — which chapter number.
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
	import type { ChapterState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: ChapterState;
	}

	const { state, ...attributes }: Props = $props();
	const chapter = $derived(state.game.chapter + 1);
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	<Text ca="Capítol %(n)" es="Capítulo %(n)" en="Chapter %(n)" n={chapter} />
</div>
