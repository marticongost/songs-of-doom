<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import { ModifyCapabilityCostEffect } from '@songsofdoom/game';
	import CapabilityCostList from '../capabilities/CapabilityCostList.svelte';

	interface Props {
		effect: ModifyCapabilityCostEffect;
	}

	const { effect }: Props = $props();
	const { increase, decrease, dynamic } = $derived(effect.group());
</script>

{#if increase}
	<Text ca="Sobrecost" es="Sobrecoste" en="Surcharge" />
	<CapabilityCostList cost={increase} />
{:else if decrease}
	<Text ca="Descompte" es="Descuento" en="Discount" />
	<CapabilityCostList cost={decrease} />
{:else if dynamic}
	<Text ca="Modificar cost" es="Modificar coste" en="Modify cost" />
	<CapabilityCostList cost={dynamic} />
{/if}
