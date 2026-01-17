<script lang="ts">
	import { TriggerAttackEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';
	import EffectList from './EffectList.svelte';
	import { standardAttributes } from '../standardattributes';
	import BlockQuote from '../BlockQuote.svelte';

	export let effect: TriggerAttackEffect;
</script>

<div {...standardAttributes($$props, 'trigger-attack-effect-chip')}>
	<Text
		ca="Activar una acció Atacar amb els següents efectes:"
		es="Activar una acción Atacar con los siguientes efectos:"
		en="Trigger an Attack action with the following effects:"
	/>
	<BlockQuote>
		<EffectList effects={effect.modifiers} />
	</BlockQuote>
</div>
