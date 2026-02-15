<script lang="ts">
	import { RepeatCapabilityEffect } from '@songsofdoom/game';
	import Text from '$lib/components/localisation/Text.svelte';

	interface Props {
		effect: RepeatCapabilityEffect;
	}

	const { effect: _effect }: Props = $props();
</script>

<Text ca="Repetir aquesta capacitat" es="Repetir esta capacidad" en="Repeat this capability" />
