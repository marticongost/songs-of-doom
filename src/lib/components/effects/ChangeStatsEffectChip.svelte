<script lang="ts">
	import { ChangeStatsEffect } from '$lib/catalog/models/effects';
	import { type StatType } from '$lib/catalog/models/stats';
	import Text from '$lib/components/localisation/Text.svelte';
	import TextList from '../localisation/TextList.svelte';
	import StatChip from '../stats/StatChip.svelte';

	interface Props {
		effect: ChangeStatsEffect;
	}

	const { effect }: Props = $props();
</script>

{#snippet renderStatValue([stat, value]: [string, number])}
	<span>
		<StatChip stat={stat as StatType} />
		<strong>
			<Text ca=" en {value}" es=" en {value}" en=" by {value}" />
		</strong>
	</span>
{/snippet}

{#if effect.group().increase}
	<Text ca="Augmentar " es="Aumentar " en="Increase " />
	<TextList items={Object.entries(effect.group().increase!)} renderItem={renderStatValue} />
{:else if effect.group().decrease}
	<Text ca="Reduir " es="Reducir " en="Decrease " />
	<TextList items={Object.entries(effect.group().decrease!)} renderItem={renderStatValue} />
{/if}
