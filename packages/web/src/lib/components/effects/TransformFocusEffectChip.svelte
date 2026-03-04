<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import { TransformFocusEffect } from '@songsofdoom/game';
	import FocusIcon from '../focuses/FocusIcon.svelte';

	interface Props {
		effect: TransformFocusEffect;
	}

	const { effect }: Props = $props();
</script>

<Text
	ca="Transformar un %(source) en %(target)"
	es="Transformar un %(source) en %(target)"
	en="Transform one %(source) into %(target)"
>
	{#snippet source()}<FocusIcon focus={effect.source} />{/snippet}
	{#snippet target()}<FocusIcon focus={effect.target} />{/snippet}
</Text>
