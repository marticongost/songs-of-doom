<script lang="ts">
	import { TriggerAttackEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';
	import BlockQuote from '../BlockQuote.svelte';
	import PropertyList from '../properties/PropertyList.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import EffectList from './EffectList.svelte';

	interface Props extends StandardAttributeProps {
		effect: TriggerAttackEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, 'trigger-attack-effect-chip')}>
	{#if effect.properties.length}
		<Text
			ca="Activar una acció Atacar, amb "
			es="Activar una acción Atacar, con "
			en="Trigger an Attack action, with "
		/>
		<PropertyList properties={effect.properties} />
	{:else}
		<Text
			ca="Activar una acció Atacar"
			es="Activar una acción Atacar"
			en="Trigger an Attack action"
		/>
	{/if}
	{#if effect.modifiers.length}
		{' i:'}
		<BlockQuote>
			<EffectList effects={effect.modifiers} />
		</BlockQuote>
	{/if}
</div>
