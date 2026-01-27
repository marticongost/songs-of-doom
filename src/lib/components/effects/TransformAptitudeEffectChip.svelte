<script lang="ts">
	import { TransformAptitudeEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';
	import AptitudeIcon from '../aptitudes/AptitudeIcon.svelte';

	interface Props {
		effect: TransformAptitudeEffect;
	}

	const { effect }: Props = $props();
</script>

<Text ca="Transformar una" es="Transformar una" en="Transform one" />
<AptitudeIcon aptitude={effect.source} />
<Text ca=" en " es=" en " en=" into " />
<AptitudeIcon aptitude={effect.target} />
