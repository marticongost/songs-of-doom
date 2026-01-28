<script lang="ts">
	import { ChaseEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';

	interface Props {
		effect: ChaseEffect;
	}

	const { effect }: Props = $props();
	void effect;
</script>

<Text ca="Perseguir" es="Perseguir" en="Chase" />
