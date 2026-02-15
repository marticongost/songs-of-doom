<script lang="ts">
	import { DrawFocusEffect } from '@songsofdoom/game';
	import Text from '$lib/components/localisation/Text.svelte';
	import { plural2 } from '@songsofdoom/common/localisation';

	interface Props {
		effect: DrawFocusEffect;
	}

	const { effect }: Props = $props();
</script>

<Text
	ca="Robar {effect.amount} {plural2(effect.amount, 'focus', 'focus')}"
	es="Robar {effect.amount} {plural2(effect.amount, 'foco', 'focos')}"
	en="Draw {effect.amount} {plural2(effect.amount, 'focus', 'focus')}"
/>
