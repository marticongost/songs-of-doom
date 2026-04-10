<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import { EngageEffect } from '@songsofdoom/game';
	import TargetChip from '../targets/TargetChip.svelte';

	interface Props {
		effect: EngageEffect;
	}

	const { effect }: Props = $props();
</script>

<TargetChip target={effect.subject} />
{#if !effect.subject}
	<Text ca="Enfrontar-se a" es="Enfrentarse a" en="Engage" />
{:else if effect.subject?.cardinality.isSingleTarget()}
	<Text ca="s'enfronta a" es="se enfrenta a" en="engages" />
{:else}
	<Text ca="s'enfronten" es="se enfrentan" en="engage" />
{/if}
<TargetChip target={effect.target} />
