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

{#snippet statsList(stats: Partial<Record<StatType, number>>)}
	<TextList items={Object.entries(stats)}>
		{#snippet entry([stat, value])}
			<span>
				<StatChip stat={stat as StatType} />
				<Text ca=" en {value}" es=" en {value}" en=" by {value}" />
			</span>
		{/snippet}
	</TextList>
{/snippet}

{#if effect.group().increase}
	<Text ca="Augmentar " es="Aumentar " en="Increase " />
	{@render statsList(effect.group().increase!)}
{:else if effect.group().decrease}
	<Text ca="Reduir " es="Reducir " en="Decrease " />
	{@render statsList(effect.group().decrease!)}
{/if}
