<!--
@component
Renders a pay effect, displaying the cost the player must pay.
-->
<script lang="ts">
	import type { PayEffect } from '@songsofdoom/game';
	import CapabilityCostList from '$lib/components/capabilities/CapabilityCostList.svelte';
	import Text from '$lib/components/localisation/Text.svelte';

	interface Props {
		/** @prop The pay effect to display. */
		effect: PayEffect;
	}

	const { effect }: Props = $props();
</script>

<span>
	<Text ca="Pagar" es="Pagar" en="Pay" />
	<CapabilityCostList cost={effect.cost} />
</span>
