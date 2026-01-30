<script lang="ts">
	import type { DiscardCardEffect } from '$lib/catalog/models/effects';
	import { expressionPlurality } from '$lib/catalog/models/expressions';
	import { plural2 } from '$lib/localisation';
	import ExpressionChip from '../ExpressionChip.svelte';
	import Text from '../localisation/Text.svelte';
	import TargetChip from '../targets/TargetChip.svelte';

	interface Props {
		effect: DiscardCardEffect;
	}

	const { effect }: Props = $props();
</script>

<Text ca="Descartar" es="Descartar" en="Discard" />
<ExpressionChip expression={effect.amount} />

{#if effect.selection === 'random'}
	<Text
		ca={plural2(expressionPlurality(effect.amount), 'carta aleatòria', 'cartes aleatòries')}
		es={plural2(expressionPlurality(effect.amount), 'carta aleatoria', 'cartas aleatorias')}
		en={plural2(expressionPlurality(effect.amount), 'random card', 'random cards')}
	/>
{:else}
	<Text
		ca={plural2(expressionPlurality(effect.amount), 'carta', 'cartes')}
		es={plural2(expressionPlurality(effect.amount), 'carta', 'cartas')}
		en={plural2(expressionPlurality(effect.amount), 'card', 'cards')}
	/>
{/if}

<TargetChip relation="possessive" ellideSelf={true} target={effect.target} />
