<script lang="ts">
	import type { EphemeralPropertiesEffect } from '$lib/catalog/models/effects';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import Text from '../localisation/Text.svelte';
	import PropertyList from '../properties/PropertyList.svelte';

	interface Props extends StandardAttributeProps {
		effect: EphemeralPropertiesEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'ephemeral-properties-effect-chip')}>
	<Text ca="Guanya temporalment" es="Gana temporalmente" en="Temporarily gain" />
	<PropertyList properties={effect.grantedProperties} />
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;
</style>
