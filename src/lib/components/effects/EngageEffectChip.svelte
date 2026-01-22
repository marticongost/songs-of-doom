<script lang="ts">
	import { EngageEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';

	interface Props {
		effect: EngageEffect;
	}

	const { effect }: Props = $props();
	void effect;
</script>

<Text ca="Enfrontar-se a un oponent" es="Enfrentarse a un oponente" en="Engage an opponent" />
