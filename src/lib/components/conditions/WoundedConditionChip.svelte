<script lang="ts">
	import type { WoundedCondition } from '$lib/catalog/models/conditions';
	import Text from '../localisation/Text.svelte';

	interface Props {
		condition: WoundedCondition;
	}

	const { condition }: Props = $props();

	const isPercentage = $derived(condition.wounds.value > 0 && condition.wounds.value < 1);
	const displayValue = $derived(
		isPercentage ? `${condition.wounds.value * 100}%` : condition.wounds.value
	);
</script>

{#if condition.wounds.metric === 'received'}
	{#if condition.wounds.operator === '>'}
		<Text ca="Més de {displayValue}" es="Más de {displayValue}" en="more than {displayValue}" />
	{:else if condition.wounds.operator === '>='}
		<Text ca="{displayValue} o més" es="{displayValue} o más" en="{displayValue} or more" />
	{:else if condition.wounds.operator === '<'}
		<Text ca="Menys de {displayValue}" es="Menos de {displayValue}" en="Less than {displayValue}" />
	{:else if condition.wounds.operator === '<='}
		<Text ca="{displayValue} o menys" es="{displayValue} o menos" en="{displayValue} or fewer" />
	{:else if condition.wounds.operator === '='}
		<Text
			ca="Exactament {displayValue}"
			es="Exactamente {displayValue}"
			en="Exactly {displayValue}"
		/>
	{/if}
	{#if condition.wounds.value == 1 && condition.wounds.operator !== '>=' && condition.wounds.operator !== '<='}
		<Text ca="ferida rebuda" es="herida recibida" en="wound received" />
	{:else}
		<Text ca="ferides rebudes" es="heridas recibidas" en="wounds received" />
	{/if}
{:else if condition.wounds.operator === '>'}
	<Text
		ca="Més de {displayValue} punts de vida restants"
		es="Más de {displayValue} puntos de vida restantes"
		en="More than {displayValue} health points remaining"
	/>
{:else if condition.wounds.operator === '>='}
	<Text
		ca="{displayValue} o més punts de vida restants"
		es="{displayValue} o más puntos de vida restantes"
		en="{displayValue} or more health points remaining"
	/>
{:else if condition.wounds.operator === '<'}
	<Text
		ca="Menys de {displayValue} punts de vida restants"
		es="Menos de {displayValue} puntos de vida restantes"
		en="Less than {displayValue} health points remaining"
	/>
{:else if condition.wounds.operator === '<='}
	<Text
		ca="{displayValue} o menys punts de vida restants"
		es="{displayValue} o menos puntos de vida restantes"
		en="{displayValue} or less health points remaining"
	/>
{:else if condition.wounds.operator === '='}
	<Text
		ca="Exactament {displayValue} punts de vida restants"
		es="Exactamente {displayValue} puntos de vida restantes"
		en="Exactly {displayValue} health points remaining"
	/>
{/if}
