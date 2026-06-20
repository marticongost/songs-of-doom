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

	const { state, ...attributes }: Props = $props();
	const amount = $derived(state.effect.amount);
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	<Text ca="Robar %(tokens)" es="Robar %(tokens)" en="Draw %(tokens)">
		{#snippet tokens()}
			{#if amount === 1}
				<Text ca="1 fitxa de focus" es="1 ficha de foco" en="1 focus token" />
			{:else}
				<Text
					ca="%(amount) fitxes de focus"
					es="%(amount) fichas de foco"
					en="%(amount) focus tokens"
					{amount}
				/>
			{/if}
		{/snippet}
	</Text>
</div>
