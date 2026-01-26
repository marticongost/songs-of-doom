<script lang="ts">
	import { ModifyRollEffect } from '$lib/catalog/models/effects';
	import ExpressionChip from '../ExpressionChip.svelte';
	import InlineSvg from '../InlineSvg.svelte';

	interface Props {
		effect: ModifyRollEffect;
	}

	const { effect }: Props = $props();
</script>

<InlineSvg src="dice/proficiency.svg" />
<ExpressionChip expression={effect.modifier} relative={true} />
