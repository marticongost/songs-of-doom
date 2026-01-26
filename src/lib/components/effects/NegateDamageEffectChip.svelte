<script lang="ts">
	import { NegateDamageEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';

	interface Props {
		effect: NegateDamageEffect;
	}

	const { effect }: Props = $props();
</script>

<Text ca="Negar tot el dany" es="Negar todo el daño" en="Negate all damage" />
