<script lang="ts">
	import type { TalentEffect } from '@songsofdoom/game';

	import Text from '$lib/components/localisation/Text.svelte';
	import TalentChip from '$lib/components/talents/TalentChip.svelte';
	import { plural2 } from '@songsofdoom/common';
	import TextList from '../localisation/TextList.svelte';

	interface Props {
		effect: TalentEffect;
	}

	const { effect }: Props = $props();
</script>

<Text ca="Posseeix %(what) %(list)" es="Posee %(what) %(list)" en="Possesses %(what) %(list)">
	{#snippet what()}
		<Text
			ca={plural2(effect.talents.length, 'el talent', 'els talents')}
			es={plural2(effect.talents.length, 'el talento', 'los talentos')}
			en={plural2(effect.talents.length, 'the talent', 'the talents')}
		/>
	{/snippet}
	{#snippet list()}
		<TextList items={effect.talents}>
			{#snippet entry(talent)}<TalentChip {talent} />{/snippet}
		</TextList>
	{/snippet}
</Text>
