<!--
	@component
	Displays a resolve encounter effect, which draws and resolves an encounter card.
-->
<script lang="ts">
	import { ResolveEncounterEffect } from '$lib/catalog/models/effects';
	import Text from '$lib/components/localisation/Text.svelte';

	interface Props {
		/** The resolve encounter effect to display. */
		effect: ResolveEncounterEffect;
	}

	const { effect: _effect }: Props = $props();
</script>

<Text ca="Resoldre un encontre" es="Resolver un encuentro" en="Resolve an encounter" />
