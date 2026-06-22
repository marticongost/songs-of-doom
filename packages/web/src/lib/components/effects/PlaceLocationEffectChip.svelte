<!--
@component
Renders a place location effect, displaying the location being placed and its coordinates.
-->
<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { PlaceLocationEffect } from '@songsofdoom/game';
	import EntityLink from '../EntityLink.svelte';

	interface Props extends StandardAttributeProps {
		effect: PlaceLocationEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes)}>
	<Text
		ca="Posar en joc %(location)"
		es="Poner en juego %(location)"
		en="Place in play %(location)"
	>
		{#snippet location()}
			<EntityLink entity={effect.id} target="_blank" />
		{/snippet}
	</Text>
</span>
