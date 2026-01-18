<script lang="ts">
	import { RechargeEffect } from '$lib/catalog/models/effects/recharge';
	import Text from '$lib/components/localisation/Text.svelte';
	import { plural2 } from '$lib/localisation';

	interface Props {
		effect: RechargeEffect;
	}

	const { effect }: Props = $props();
</script>

{#if effect.amount === 'max'}
	<Text ca="Recarregar del tot" es="Recargar del todo" en="Recharge fully" />
{:else}
	<Text
		ca="Recuperar fins a {plural2(effect.amount, 'una càrrega', `${effect.amount} càrregues`)}"
		es="Recuperar hasta {plural2(effect.amount, 'una carga', `${effect.amount} cargas`)}"
		en="Recover up to {plural2(effect.amount, 'one charge', `${effect.amount} charges`)}"
	/>
{/if}
