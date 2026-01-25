<script lang="ts">
	import type { WoundEffect } from '$lib/catalog/models/effects';
	import ConditionList from '../conditions/ConditionList.svelte';
	import DamageChip from '../damage/DamageChip.svelte';
	import Text from '../localisation/Text.svelte';
	import PropertyList from '../properties/PropertyList.svelte';

	interface Props {
		effect: WoundEffect;
	}

	const { effect }: Props = $props();
</script>

<DamageChip amount={effect.damage} />

{#if effect.properties.length}
	<Text ca="amb" es="con" en="with" />
	<PropertyList properties={effect.properties} />
{/if}

<!-- TODO: Move to a TargetChip component -->
{#if effect.target.type === 'enemy'}
	<Text ca="a un enemic" es="a un enemigo" en="to an enemy" />
{:else if effect.target.type === 'allEnemies'}
	<Text ca="a tots els enemics" es="a todos los enemigos" en="to all enemies" />
{:else if effect.target.type === 'self'}
	<Text ca="a tu mateix" es="a ti mismo" en="to yourself" />
{:else if effect.target.type === 'ally'}
	<Text ca="a un aliat" es="a un aliado" en="to an ally" />
{:else if effect.target.type === 'allAllies'}
	<Text ca="a tots els teus aliats" es="a todos tus aliados" en="to all your allies" />
{/if}

{#if effect.target.conditions.length}
	<ConditionList conditions={effect.target.conditions} />
{/if}
