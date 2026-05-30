<script lang="ts">
	import { ModifyInitiativeEffect } from '@songsofdoom/game';
	import InitiativeIndicator from '../indicators/InitiativeIndicator.svelte';

	interface Props {
		effect: ModifyInitiativeEffect;
	}

	const { effect }: Props = $props();
</script>

<InitiativeIndicator amount={effect.modifier} />
