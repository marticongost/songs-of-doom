<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import { type RedrawFocusEffect } from '@songsofdoom/game';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';

	interface Props {
		effect: RedrawFocusEffect;
	}

	const { effect }: Props = $props();
</script>

{#if effect.amount === 1}
	<Text ca="Descartar i robar 1 focus" es="Descartar i robar 1 foco" en="Redraw 1 focus" />
{:else}
	<Text
		ca="Descartar i robar fins a %(amount) focus"
		es="Descartar i robar hasta %(amount) foco"
		en="Redraw up to %(amount) focus"
	>
		{#snippet amount()}
			<ExpressionChip expression={effect.amount} />
		{/snippet}
	</Text>
{/if}
