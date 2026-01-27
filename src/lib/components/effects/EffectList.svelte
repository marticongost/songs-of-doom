<script lang="ts">
	import type { Effect } from '$lib/catalog/models/effects';
	import TextList from '../localisation/TextList.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import EffectChip from './EffectChip.svelte';

	interface Props extends StandardAttributeProps {
		effects: Effect[];
	}
	const { effects, ...attributes }: Props = $props();
</script>

{#snippet effectSnippet(effect: Effect)}
	<EffectChip {effect} />
{/snippet}

<TextList
	{...standardAttributes(attributes, 'effect-list')}
	items={effects}
	type="commas"
	renderItem={effectSnippet}
/>

<style lang="scss">
	@use '@reguitzell/styles' as rz;
	.effect-list {
		@include rz.column(sm);
		align-items: stretch;
	}
</style>
