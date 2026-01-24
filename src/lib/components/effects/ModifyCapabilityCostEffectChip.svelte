<script lang="ts">
	import { ModifyCapabilityCostEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';
	import CapabilityCostList from '../capabilities/CapabilityCostList.svelte';

	interface Props {
		effect: ModifyCapabilityCostEffect;
	}

	const { effect }: Props = $props();
	const { increase, decrease } = $derived(effect.group());
</script>

{#if increase}
	<Text ca="Sobrecost" es="Sobrecoste" en="Surcharge" />
	<CapabilityCostList cost={increase} />
{:else if decrease}
	<Text ca="Descompte" es="Descuento" en="Discount" />
	<CapabilityCostList cost={decrease} />
{/if}
