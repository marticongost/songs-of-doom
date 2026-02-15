<script lang="ts">
	import { type RedrawFateEffect } from '@songsofdoom/game';
	import Text from '$lib/components/localisation/Text.svelte';

	interface Props {
		effect: RedrawFateEffect;
	}

	const { effect: _effect }: Props = $props();
</script>

<Text
	ca="Robar una nova fitxa de destí"
	es="Robar una nueva ficha de destino"
	en="Draw a new fate token"
/>
