<script lang="ts">
	import { ImmobilizeEffect } from '@songsofdoom/game';
	import Text from '$lib/components/localisation/Text.svelte';

	interface Props {
		effect: ImmobilizeEffect;
	}

	const { effect: _ }: Props = $props();
</script>

<Text ca="Immobilitzar" es="Inmovilizar" en="Immobilize" />
