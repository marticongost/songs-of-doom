<script lang="ts">
	import type { TalentEffect } from '@songsofdoom/game';

	import Text from '$lib/components/localisation/Text.svelte';
	import TalentChip from '$lib/components/talents/TalentChip.svelte';

	interface Props {
		effect: TalentEffect;
	}

	const { effect }: Props = $props();
</script>

<Text
	ca="Posseeix el talent %(talent)"
	es="Posee el talento %(talent)"
	en="Possesses the talent %(talent)"
>
	{#snippet talent()}
		<TalentChip talent={effect.talent} />
	{/snippet}
</Text>
