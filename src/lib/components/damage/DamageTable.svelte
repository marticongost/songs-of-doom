<script lang="ts">
	import type { DamageTable } from '$lib/catalog/models/effects/attack';
	import ResultSelectorChip from '../ResultSelectorChip.svelte';
	import { standardAttributes } from '../standardattributes';
	import DamageChip from './DamageChip.svelte';

	export let damage: DamageTable;
	const sortedDamageEntries = damage.toSorted((a, b) => {
		const aKey = typeof a.result === 'number' ? a.result : (a.result.min ?? 0);
		const bKey = typeof b.result === 'number' ? b.result : (b.result.min ?? 0);
		return aKey - bKey;
	});
</script>

<span {...standardAttributes($$props, 'damage-table')}>
	{#each sortedDamageEntries as entry}
		<span class="entry">
			<ResultSelectorChip result={entry.result} />
			<DamageChip amount={entry.inflictedDamage} />
		</span>
	{/each}
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.damage-table {
		:global(.damage-icon) {
			color: var(--stat-health-color);
		}
	}

	:global(.damage-table > * + *) {
		margin-left: rz.size(sm);
	}

	.entry {
		white-space: nowrap;
	}

	.inflicted-damage {
		margin-left: rz.size(xs);
	}
</style>
