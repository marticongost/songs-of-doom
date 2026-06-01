<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import { TriggerActionEffect } from '@songsofdoom/game';
	import Parameters from '../capabilities/Parameters.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import TargetChip from '../targets/TargetChip.svelte';
	import EffectList from './EffectList.svelte';

	interface Props extends StandardAttributeProps {
		effect: TriggerActionEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'trigger-attack-effect-chip')}>
	{#if effect.actionType === 'move'}
		<Text ca="Activar una acció Moure" es="Activar una acción Mover" en="Trigger a Move action" />
	{:else if effect.actionType === 'attack'}
		<Text
			ca="Activar una acció Atacar"
			es="Activar una acción Atacar"
			en="Trigger an Attack action"
		/>
	{:else if effect.actionType === 'investigate'}
		<Text
			ca="Activar una acció Investigar"
			es="Activar una acción Investigar"
			en="Trigger an Investigate action"
		/>
	{:else if effect.actionType === 'evade'}
		<Text
			ca="Activar una acció Evadir"
			es="Activar una acción Evadir"
			en="Trigger an Evade action"
		/>
	{:else if effect.actionType === undefined}
		<Text ca="Activar una acció" es="Activar una acción" en="Trigger an action" />
	{/if}
	<TargetChip target={effect.card} relation="possessive" />
	{#if effect.target}
		<Text ca="contra" es="contra" en="against" />
		<TargetChip target={effect.target} />
	{/if}
	{#if effect.modifiers.length}
		<Parameters><EffectList effects={effect.modifiers} /></Parameters>{/if}<!--
--></span
>
