<script lang="ts">
	import type { DiscardFromHandEffect } from '@songsofdoom/game';
	import { expressionPlurality } from '@songsofdoom/game';
	import ExpressionChip from '$lib/components/expressions/ExpressionChip.svelte';
	import { plural2 } from '@songsofdoom/common/localisation';
	import Text from '../localisation/Text.svelte';
	import TargetChip from '../targets/TargetChip.svelte';

	interface Props {
		effect: DiscardFromHandEffect;
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

<TargetChip relation="possessive" target={effect.target} />
