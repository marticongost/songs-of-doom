<script lang="ts">
	import type { RemoveChargesEffect } from '$lib/catalog/models/effects';
	import ExpressionChip from '../ExpressionChip.svelte';
	import Text from '../localisation/Text.svelte';
	import TargetChip from '../targets/TargetChip.svelte';

	interface Props {
		effect: RemoveChargesEffect;
	}

	const { effect }: Props = $props();
</script>

<Text ca="Eliminar" es="Eliminar" en="Remove" />
<ExpressionChip statExpression={effect.amount} />
<Text ca="càrregues" es="cargas" en="charges" />
<TargetChip relation="possessive" target={effect.target} />
