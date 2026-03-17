<script lang="ts">
	import type { ReplacePropertyEffect } from '@songsofdoom/game';
	import Text from '../localisation/Text.svelte';
	import PropertyChip from '../properties/PropertyChip.svelte';

	interface Props {
		effect: ReplacePropertyEffect;
	}

	const { effect }: Props = $props();
</script>

<Text
	ca="Substitueix %(original) per %(replacement)"
	es="Sustituye %(original) por %(replacement)"
	en="Replace %(original) with %(replacement)"
>
	{#snippet original()}
		<PropertyChip property={effect.original} />
	{/snippet}
	{#snippet replacement()}
		<PropertyChip property={effect.replacement} />
	{/snippet}
</Text>
