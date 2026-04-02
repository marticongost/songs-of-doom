<script lang="ts">
	import type { DiscardFromHandEffect } from '@songsofdoom/game';
	import Text from '../localisation/Text.svelte';
	import TargetChip from '../targets/TargetChip.svelte';

	interface Props {
		effect: DiscardFromHandEffect;
	}

	const { effect }: Props = $props();
</script>

<Text ca="Descartar" es="Descartar" en="Discard" />
<TargetChip target={effect.cards} />
<TargetChip relation="possessive" target={effect.players} />
