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

<TextList {...standardAttributes(attributes, 'effect-list')} items={effects} type="commas">
	{#snippet entry(effect)}
		<EffectChip {effect} />
	{/snippet}
</TextList>
