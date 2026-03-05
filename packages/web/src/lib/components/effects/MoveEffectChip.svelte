<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import { MoveEffect } from '@songsofdoom/game';

	interface Props {
		effect: MoveEffect;
	}

	const { effect: _ }: Props = $props();
</script>

<Text ca="Moure" es="Mover" en="Move" />
