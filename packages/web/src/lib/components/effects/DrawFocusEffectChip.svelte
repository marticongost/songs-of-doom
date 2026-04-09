<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import { plural2 } from '@songsofdoom/common/localisation';
	import { DrawFocusEffect } from '@songsofdoom/game';
	import TargetChip from '../targets/TargetChip.svelte';

	interface Props {
		effect: DrawFocusEffect;
	}

	const { effect }: Props = $props();
</script>

{#if !effect.players}
	<Text
		ca="Robar {effect.amount} focus"
		es="Robar {effect.amount} foco"
		en="Draw {effect.amount} focus"
	/>
{:else}
	<TargetChip target={effect.players} />
	{#if effect.players?.cardinality.isSingleTarget()}
		<Text
			ca="roba {effect.amount} focus"
			es="roba {effect.amount} foco"
			en="draws {effect.amount} focus"
		/>
	{:else}
		<Text
			ca="roben {effect.amount} {plural2(effect.amount, 'focus', 'focus')}"
			es="roben {effect.amount} {plural2(effect.amount, 'foco', 'focos')}"
			en="draw {effect.amount} {plural2(effect.amount, 'focus', 'focus')}"
		/>
	{/if}
{/if}
