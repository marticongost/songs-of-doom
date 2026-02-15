<script lang="ts">
	import { TriggerAttackEffect } from '@songsofdoom/game';
	import Text from '$lib/components/localisation/Text.svelte';
	import Parameters from '../capabilities/Parameters.svelte';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import EffectList from './EffectList.svelte';

	interface Props extends StandardAttributeProps {
		effect: TriggerAttackEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'trigger-attack-effect-chip')}>
	<Text
		ca="Activar una acció Atacar"
		es="Activar una acción Atacar"
		en="Trigger an Attack action"
	/>
	{#if effect.card === 'this'}
		<Text ca="d'aquesta carta" es="de esta carta" en="of this card" />
	{/if}
	<ExpressionChip expression={effect.condition} />
	{#if effect.modifiers.length}
		<Parameters><EffectList effects={effect.modifiers} /></Parameters>{/if}<!--
--></span
>
