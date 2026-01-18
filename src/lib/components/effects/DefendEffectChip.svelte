<script lang="ts">
	import { DefendEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';
	import StatExpressionChip from '../StatExpressionChip.svelte';
	import PropertyList from '../properties/PropertyList.svelte';

	interface Props {
		effect: DefendEffect;
	}

	const { effect }: Props = $props();
</script>

<Text ca="Defensar amb" es="Defender con" en="Defend with" />

<StatExpressionChip statExpression={effect.expression} />

{#if effect.properties.length}
	{', '}
{/if}
<PropertyList properties={effect.properties} />
