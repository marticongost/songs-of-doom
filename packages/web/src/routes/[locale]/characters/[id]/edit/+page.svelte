<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import CharacterDetail from '$lib/components/characters/CharacterDetail.svelte';
	import EntityCatalog from '$lib/components/entities/EntityCatalog.svelte';
	import type { EntityManager } from '$lib/components/entities/entitymanager';
	import ErrorMessage from '$lib/components/errors/ErrorMessage.svelte';
	import SuccessMessage from '$lib/components/feedback/SuccessMessage.svelte';
	import ToolbarButton from '$lib/components/toolbar/ToolbarButton.svelte';
	import ToolbarGroup from '$lib/components/toolbar/ToolbarGroup.svelte';
	import { characterStateToJson } from '$lib/database/characterstate';
	import { EntitySearchState } from '$lib/search';
	import { characterUrl } from '$lib/urls';
	import { entities, type CharacterState, type EntityTypeId } from '@songsofdoom/game';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	const { character } = data;

	let history = $state<CharacterState[]>([character.newestRevision.state]);
	let historyIndex = $state(0);
	const characterState = $derived(history[historyIndex]);
	const canUndo = $derived(historyIndex > 0);
	const canRedo = $derived(historyIndex < history.length - 1);

	function pushState(newState: CharacterState) {
		history = [...history.slice(0, historyIndex + 1), newState];
		historyIndex = history.length - 1;
	}

	function undo() {
		if (canUndo) historyIndex--;
	}

	function redo() {
		if (canRedo) historyIndex++;
	}

	function stableStateJson(state: CharacterState): string {
		const json = characterStateToJson(state);
		return JSON.stringify({
			name: json.name,
			finalised: json.finalised,
			gold: json.gold,
			portrait: json.portrait,
			upgrades: Object.fromEntries(Object.entries(json.upgrades).sort()),
			skillsDeck: Object.fromEntries(Object.entries(json.skillsDeck).sort())
		});
	}

	let savedStateJson = $state(stableStateJson(character.newestRevision.state));
	const hasModifications = $derived(stableStateJson(characterState) !== savedStateJson);

	type SaveStatus = 'idle' | 'saving' | 'success' | 'error';
	let saveStatus = $state<SaveStatus>('idle');
	let saveMessage = $state<string | undefined>();
	let successTimeout: ReturnType<typeof setTimeout> | undefined;

	const allowedTypes: EntityTypeId[] = ['archetype', 'trait', 'skill', 'item', 'ally'];
	const allEntities = entities
		.all()
		.filter((e) => allowedTypes.includes(e.type.id) && !e.isStandard());

	const searchState = new EntitySearchState({
		allowedTypes,
		syncUrl: false,
		characterState: characterState,
		defaultCharacterFilter: 'unlocked'
	});

	$effect(() => {
		searchState.setCharacterState(characterState);
	});

	let catalogRef: EntityCatalog | undefined;

	function handleFilterClick(entityTypeId: EntityTypeId) {
		searchState.setType(entityTypeId);
		catalogRef?.scrollIntoViewAndFocus();
	}

	const entityManager: EntityManager = {
		getNumberOfOwnedCopies(entity) {
			return characterState.getNumberOfOwnedCopies(entity);
		},
		getAcquisitionImpediment(entity, options) {
			return characterState.getEntityAcquisitionImpediment(entity, options);
		},
		getRemovalImpediment(entity) {
			return characterState.getEntityRemovalImpediment(entity, character.newestRevision.state);
		},
		getMissingDependencies(entity) {
			return characterState.getMissingDependencies(entity);
		},
		onEntityAdded(entity) {
			pushState(characterState.acquireEntity(entity));
		},
		onEntityRemoved(entity) {
			pushState(characterState.returnEntity(entity));
		}
	};

	function handlePortraitChange(portrait: number) {
		pushState(characterState.withPortrait(portrait));
	}
</script>

<CharacterDetail
	{characterState}
	{entityManager}
	onFilterClick={handleFilterClick}
	onPortraitChange={handlePortraitChange}
	cardSetsLayout="single-column"
>
	{#snippet toolbarActions()}
		<ToolbarGroup>
			<ToolbarButton
				icon="undo.svg"
				label={{ ca: 'Desfer', es: 'Deshacer', en: 'Undo' }}
				disabled={!canUndo}
				onclick={undo}
			/>
			<ToolbarButton
				icon="redo.svg"
				label={{ ca: 'Refer', es: 'Rehacer', en: 'Redo' }}
				disabled={!canRedo}
				onclick={redo}
			/>
		</ToolbarGroup>
		<ToolbarGroup>
			<form
				method="POST"
				action="?/save"
				use:enhance={() => {
					saveStatus = 'saving';
					saveMessage = undefined;
					return async ({ result }) => {
						if (result.type === 'success' && result.data) {
							saveStatus = 'success';
							saveMessage = (result.data as { message?: string }).message;
							savedStateJson = stableStateJson(characterState);
							invalidate(`character:${character.id}`);
							clearTimeout(successTimeout);
							successTimeout = setTimeout(() => {
								saveStatus = 'idle';
							}, 3000);
						} else if (result.type === 'failure' && result.data) {
							saveStatus = 'error';
							saveMessage = (result.data as { message?: string }).message;
						}
					};
				}}
			>
				<input
					type="hidden"
					name="state"
					value={JSON.stringify(characterStateToJson(characterState))}
				/>
				<ToolbarButton
					icon="accept.svg"
					label={{ ca: 'Desar', es: 'Guardar', en: 'Save' }}
					busy={saveStatus === 'saving'}
					disabled={!hasModifications}
				/>
			</form>
			{#if hasModifications}
				<ToolbarButton
					icon="revert.svg"
					label={{ ca: 'Cancel·lar', es: 'Cancelar', en: 'Cancel' }}
					href={characterUrl.get(character)}
				/>
			{:else}
				<ToolbarButton
					icon="up.svg"
					label={{ ca: 'Tancar', es: 'Cerrar', en: 'Close' }}
					href={characterUrl.get(character)}
				/>
			{/if}
		</ToolbarGroup>
		<ToolbarGroup>
			{#if !character.newestRevision.finalised}
				<ToolbarButton
					icon="finalize.svg"
					label={{ ca: 'Finalitzar', es: 'Finalizar', en: 'Finalize' }}
				/>
			{/if}
		</ToolbarGroup>

		{#if saveStatus === 'success' && saveMessage}
			<SuccessMessage>{saveMessage}</SuccessMessage>
		{/if}
		{#if saveStatus === 'error' && saveMessage}
			<ErrorMessage>{saveMessage}</ErrorMessage>
		{/if}
	{/snippet}

	{#snippet catalog()}
		<EntityCatalog
			bind:this={catalogRef}
			entities={allEntities}
			search={searchState}
			dimLocked={true}
			{entityManager}
		/>
	{/snippet}
</CharacterDetail>
