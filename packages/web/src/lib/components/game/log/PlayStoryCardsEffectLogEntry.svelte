<!--
	@component Renders a PlayStoryCardsEffect journal entry.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		entry: {}
	});
</script>

<script lang="ts">
	import EntityLink from '$lib/components/EntityLink.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import TextList from '$lib/components/localisation/TextList.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { PlayStoryCardsEffectState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: PlayStoryCardsEffectState;
	}

	const { state, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	<Text ca="Posar en joc %(cards)" es="Poner en juego %(cards)" en="Play %(cards)">
		{#snippet cards()}
			<TextList items={state.effect.cards}>
				{#snippet entry(card)}
					<EntityLink entity={card} />
				{/snippet}
			</TextList>
		{/snippet}
	</Text>
</div>
