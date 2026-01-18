<script lang="ts">
	import { TriggerAttackEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';
	import BlockQuote from '../BlockQuote.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import EffectList from './EffectList.svelte';

	interface Props extends StandardAttributeProps {
		effect: TriggerAttackEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, 'trigger-attack-effect-chip')}>
	<Text
		ca="Activar una acció Atacar amb els següents efectes:"
		es="Activar una acción Atacar con los siguientes efectos:"
		en="Trigger an Attack action with the following effects:"
	/>
	<BlockQuote>
		<EffectList effects={effect.modifiers} />
	</BlockQuote>
</div>
