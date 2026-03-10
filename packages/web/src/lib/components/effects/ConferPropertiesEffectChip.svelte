<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { ConferPropertiesEffect } from '@songsofdoom/game';
	import Text from '../localisation/Text.svelte';
	import PropertyList from '../properties/PropertyList.svelte';

	interface Props extends StandardAttributeProps {
		effect: ConferPropertiesEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'confer-properties-effect-chip')}>
	<Text ca="Proporciona" es="Proporciona" en="Gain" />
	<PropertyList properties={effect.properties} />
</span>
