<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import { EngageEffect } from '@songsofdoom/game';
	import TargetChip from '../targets/TargetChip.svelte';

	interface Props {
		effect: EngageEffect;
	}

	const { effect }: Props = $props();
</script>

<Text ca="Enfrontar-se a" es="Enfrentarse a" en="Engage" />
<TargetChip target={effect.target} />
