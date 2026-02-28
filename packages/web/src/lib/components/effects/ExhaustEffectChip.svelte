<script lang="ts">
	import type { ExhaustEffect } from '@songsofdoom/game';
	import InlineSvg from '../InlineSvg.svelte';
	import TargetChip from '../targets/TargetChip.svelte';

	interface Props {
		effect: ExhaustEffect;
	}

	const { effect }: Props = $props();
</script>

<InlineSvg src="capabilities/exhaust.svg" />
<TargetChip target={effect.target} />
