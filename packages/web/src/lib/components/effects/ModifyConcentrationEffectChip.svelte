<script lang="ts">
	import { ModifyConcentrationEffect } from '@songsofdoom/game';
	import ConcentrationIndicator from '../indicators/ConcentrationIndicator.svelte';

	interface Props {
		effect: ModifyConcentrationEffect;
	}

	const { effect }: Props = $props();
</script>

<ConcentrationIndicator amount={effect.modifier} />
