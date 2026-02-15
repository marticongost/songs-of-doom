<script lang="ts">
	import { ChaseEffect } from '@songsofdoom/game';
	import Text from '$lib/components/localisation/Text.svelte';

	interface Props {
		effect: ChaseEffect;
	}

	const { effect: _effect }: Props = $props();
</script>

<Text ca="Perseguir" es="Perseguir" en="Chase" />
