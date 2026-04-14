<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import TargetChip from '$lib/components/targets/TargetChip.svelte';
	import { GoTowardsEffect } from '@songsofdoom/game';

	interface Props {
		effect: GoTowardsEffect;
	}

	const { effect }: Props = $props();
</script>

<Text
	ca="Avançar cap a %(destination)"
	es="Avanzar hacia %(destination)"
	en="Advance towards %(destination)"
>
	{#snippet destination()}
		<TargetChip target={effect.destination} />
	{/snippet}
</Text>
