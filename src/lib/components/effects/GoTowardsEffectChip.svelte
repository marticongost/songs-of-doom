<script lang="ts">
	import { GoTowardsEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';
	import TargetChip from '$lib/components/targets/TargetChip.svelte';

	interface Props {
		effect: GoTowardsEffect;
	}

	const { effect }: Props = $props();
</script>

<Text
	ca="Avançar %(target) cap a %(destination)"
	es="Avanzar %(target) hacia %(destination)"
	en="Advance %(target) towards %(destination)"
>
	{#snippet target()}
		<TargetChip target={effect.target} />
	{/snippet}
	{#snippet destination()}
		<TargetChip target={effect.destination} />
	{/snippet}
</Text>
