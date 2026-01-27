<script lang="ts">
	import { TransformFocusEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';
	import FocusIcon from '../focuses/FocusIcon.svelte';

	interface Props {
		effect: TransformFocusEffect;
	}

	const { effect }: Props = $props();
</script>

<Text ca="Transformar una" es="Transformar una" en="Transform one" />
<FocusIcon focus={effect.source} />
<Text ca=" en " es=" en " en=" into " />
<FocusIcon focus={effect.target} />
