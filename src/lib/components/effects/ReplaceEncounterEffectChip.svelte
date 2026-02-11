<!--
	@component
	Displays a replace encounter effect, which discards the current encounter and draws a new one.
-->
<script lang="ts">
	import { ReplaceEncounterEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';

	interface Props {
		/** The replace encounter effect to display. */
		effect: ReplaceEncounterEffect;
	}

	const { effect: _effect }: Props = $props();
</script>

<Text
	ca="Substituir l'encontre per un de nou"
	es="Sustituir el encuentro por uno nuevo"
	en="Replace with new encounter"
/>
