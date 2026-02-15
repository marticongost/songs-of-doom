<script lang="ts">
	import { ModifyRollEffect } from '@songsofdoom/game';
	import ProficiencyChip from '../ProficiencyChip.svelte';

	interface Props {
		effect: ModifyRollEffect;
	}

	const { effect }: Props = $props();
</script>

<ProficiencyChip expression={effect.modifier} relative={true} />
