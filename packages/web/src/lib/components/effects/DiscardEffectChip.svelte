<!--
@component
Renders a DiscardEffect, which discards the card triggering the effect.
-->
<script lang="ts">
	import type { DiscardEffect } from '@songsofdoom/game';
	import Text from '../localisation/Text.svelte';

	interface Props {
		/** The discard effect to render. */
		effect: DiscardEffect;
	}

	const { effect: _ }: Props = $props();
</script>

<Text ca="Descartar aquesta carta" es="Descartar esta carta" en="Discard this card" />
