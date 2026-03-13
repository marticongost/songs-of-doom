<script lang="ts">
	import { SetRollResultEffect } from '@songsofdoom/game';
	import ResultSelectorChip from '../ResultSelectorChip.svelte';

	interface Props {
		effect: SetRollResultEffect;
	}

	const { effect }: Props = $props();
</script>

<ResultSelectorChip result={effect.result} />
