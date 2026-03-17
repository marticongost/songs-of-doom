<!--
@component
Renders an attach effect, displaying the target to which the card attaches.
-->
<script lang="ts">
	import type { AttachEffect } from '@songsofdoom/game';
	import Text from '../localisation/Text.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import TargetChip from '../targets/TargetChip.svelte';

	interface Props extends StandardAttributeProps {
		effect: AttachEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'attach-effect-chip')}>
	{#if effect.stacking}
		<Text ca="Vincular" es="Vincular" en="Attach" />
	{:else}
		<Text ca="Vincular (única)" es="Vincular (única)" en="Attach (unique)" />
	{/if}
	<TargetChip target={effect.target} relation="to" />
</span>
