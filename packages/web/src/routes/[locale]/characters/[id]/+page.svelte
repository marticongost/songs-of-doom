<script lang="ts">
	import CharacterDetail from '$lib/components/characters/CharacterDetail.svelte';
	import ToolbarButton from '$lib/components/toolbar/ToolbarButton.svelte';
	import { editCharacterUrl } from '$lib/urls';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	const { character, canEdit } = $derived(data);
	const characterState = $derived(character.newestRevision.state);
</script>

<CharacterDetail {character} {characterState} cardSetsLayout="multi-column">
	{#snippet toolbarActions()}
		{#if canEdit}
			<ToolbarButton
				icon="edit.svg"
				label={{ ca: 'Editar', es: 'Editar', en: 'Edit' }}
				href={editCharacterUrl.get(character)}
			/>
		{/if}
	{/snippet}
</CharacterDetail>
