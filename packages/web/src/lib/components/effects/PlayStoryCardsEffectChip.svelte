<script lang="ts">
	import EntityLink from '$lib/components/EntityLink.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import TextList from '$lib/components/localisation/TextList.svelte';
	import { PlayStoryCardsEffect } from '@songsofdoom/game';

	interface Props {
		effect: PlayStoryCardsEffect;
	}

	const { effect }: Props = $props();
</script>

<Text ca="Posar en joc %(cards)" es="Poner en juego %(cards)" en="Put %(cards) in play">
	{#snippet cards()}
		<TextList items={effect.cards} type="and">
			{#snippet entry(card)}
				<EntityLink entity={card} />
			{/snippet}
		</TextList>
	{/snippet}
</Text>
