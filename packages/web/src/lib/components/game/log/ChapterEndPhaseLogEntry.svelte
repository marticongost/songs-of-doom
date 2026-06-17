<!--
	@component Renders a ChapterEndPhase journal entry — chapter ends.
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
	import type { ChapterEndState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: ChapterEndState;
	}

	const { state, ...attributes }: Props = $props();
	const chapter = $derived(state.game.chapter);
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	<Text ca="Fi del capítol %(n)" es="Fin del capítulo %(n)" en="Chapter %(n) ends" n={chapter} />
</div>
