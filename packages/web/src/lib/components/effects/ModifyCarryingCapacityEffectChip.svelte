<script lang="ts">
	import { ModifyCarryingCapacityEffect } from '@songsofdoom/game';
	import Text from '$lib/components/localisation/Text.svelte';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';

	interface Props {
		effect: ModifyCarryingCapacityEffect;
	}

	const { effect }: Props = $props();
</script>

<Text ca="Capacitat de càrrega" es="Capacidad de carga" en="Carrying capacity" />
<ExpressionChip expression={effect.modifier} relative={true} />
