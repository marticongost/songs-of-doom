<script lang="ts">
	import type { EphemeralPropertiesEffect } from '$lib/catalog/models/effects';
	import PropertyList from '../properties/PropertyList.svelte';
	import Text from '../localisation/Text.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';

	interface Props extends StandardAttributeProps {
		effect: EphemeralPropertiesEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, 'ephemeral-properties-effect-chip')}>
	<Text ca="Guanya temporalment" es="Gana temporalmente" en="Temporarily gain" />
	<PropertyList properties={effect.grantedProperties} />
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;
</style>
