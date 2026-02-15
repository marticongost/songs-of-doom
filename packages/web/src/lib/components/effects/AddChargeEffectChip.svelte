<script lang="ts">
	import { AddChargesEffect } from '@songsofdoom/game';
	import Text from '$lib/components/localisation/Text.svelte';
	import { plural2 } from '@songsofdoom/common/localisation';
	import TargetChip from '../targets/TargetChip.svelte';

	interface Props {
		effect: AddChargesEffect;
	}

	const { effect }: Props = $props();
</script>

{#if effect.amount === 'max'}
	<Text ca="Recarregar del tot" es="Recargar del todo" en="Recharge fully" />
{:else}
	<Text
		ca="Afegir {plural2(effect.amount, 'una càrrega', `${effect.amount} càrregues`)}"
		es="Añadir {plural2(effect.amount, 'una carga', `${effect.amount} cargas`)}"
		en="Add {plural2(effect.amount, 'one charge', `${effect.amount} charges`)}"
	/>
{/if}

<TargetChip relation="possessive" target={effect.target} />
