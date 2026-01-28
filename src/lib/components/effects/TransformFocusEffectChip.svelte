<script lang="ts">
	import { TransformFocusEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';
	import FocusIcon from '../focuses/FocusIcon.svelte';

	interface Props {
		effect: TransformFocusEffect;
	}

	const { effect }: Props = $props();
</script>

<Text
	ca="Transformar una %(source) en %(target)"
	es="Transformar una %(source) en %(target)"
	en="Transform one %(source) into %(target)">
	{#snippet source()}<FocusIcon focus={effect.source} />{/snippet}
	{#snippet target()}<FocusIcon focus={effect.target} />{/snippet}
</Text>
