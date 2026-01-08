<script lang="ts">
	import type { Effect } from '$lib/catalog/models/effects';
	import EffectChip from './EffectChip.svelte';
	import { standardAttributes } from '../standardattributes';

	export let effects: Effect[];
</script>

<ul {...standardAttributes($$props, 'effect-list')}>
	{#each effects as effect}
		<li class="effect"><EffectChip {effect} /></li>
	{/each}
</ul>

<style lang="scss">
	@use '@reguitzell/styles' as rz;
	.effect-list {
		@include rz.column(sm);
		align-items: stretch;
	}
</style>
