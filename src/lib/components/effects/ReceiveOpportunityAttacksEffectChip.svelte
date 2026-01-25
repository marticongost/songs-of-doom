<script lang="ts">
	import { ReceiveOpportunityAttacksEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';
	import BlockQuote from '../BlockQuote.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import EffectList from './EffectList.svelte';

	interface Props extends StandardAttributeProps {
		effect: ReceiveOpportunityAttacksEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, 'receive-opportunity-attacks-effect-chip')}>
	<Text
		ca="Concedir atacs d'oportunitat"
		es="Conceder ataques de oportunidad"
		en="Concede opportunity attacks"
	/>
	{#if effect.effects.length}
		{' aplicant:'}
		<BlockQuote>
			<EffectList effects={effect.effects} />
		</BlockQuote>
	{/if}
</div>
