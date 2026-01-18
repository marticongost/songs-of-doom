<script lang="ts">
	import type { Effect } from '$lib/catalog/models/effects';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import EffectChip from './EffectChip.svelte';

	interface Props extends StandardAttributeProps {
		effects: Effect[];
	}
	const { effects, ...attributes }: Props = $props();
</script>

<ul {...standardAttributes(attributes, 'effect-list')}>
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
