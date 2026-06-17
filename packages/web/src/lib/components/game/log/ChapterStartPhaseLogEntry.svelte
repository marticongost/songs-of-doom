<!--
	@component Renders a ChapterStartPhase journal entry — chapter begins.
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
	import type { ChapterStartState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: ChapterStartState;
	}

	const { state, ...attributes }: Props = $props();
	const chapter = $derived(state.game.chapter);
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	<Text
		ca="Inici del capítol %(n)"
		es="Inicio del capítulo %(n)"
		en="Chapter %(n) begins"
		n={chapter}
	/>
</div>
