<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import { TriggerAttackEffect } from '@songsofdoom/game';
	import Parameters from '../capabilities/Parameters.svelte';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import TargetChip from '../targets/TargetChip.svelte';
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
	<ExpressionChip expression={effect.condition} />
	<TargetChip target={effect.card} relation="possessive" />
	{#if effect.target}
		<Text ca="contra" es="contra" en="against" />
		<TargetChip target={effect.target} />
	{/if}
	{#if effect.modifiers.length}
		<Parameters><EffectList effects={effect.modifiers} /></Parameters>{/if}<!--
--></span
>
