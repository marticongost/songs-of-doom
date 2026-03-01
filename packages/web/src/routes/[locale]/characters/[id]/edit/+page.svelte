<script lang="ts">
	import { enhance } from '$app/forms';
	import CharacterDetail from '$lib/components/characters/CharacterDetail.svelte';
	import EntityCatalog from '$lib/components/entities/EntityCatalog.svelte';
	import type { EntityManager } from '$lib/components/entities/entitymanager';
	import ErrorMessage from '$lib/components/errors/ErrorMessage.svelte';
	import SuccessMessage from '$lib/components/feedback/SuccessMessage.svelte';
	import ToolbarButton from '$lib/components/toolbar/ToolbarButton.svelte';
	import { characterStateToJson } from '$lib/database/characterstate';
	import { EntitySearchState } from '$lib/search';
	import { characterUrl } from '$lib/urls';
	import { entities, type CharacterState, type EntityTypeId } from '@songsofdoom/game';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	const { character } = data;
	let characterState = $state(character.newestRevision.state);

	function stableStateJson(state: CharacterState): string {
		const json = characterStateToJson(state);
		return JSON.stringify({
			finalised: json.finalised,
			gold: json.gold,
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

	const searchState = new EntitySearchState({ allowedTypes, syncUrl: false });

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
			characterState = characterState.acquireEntity(entity);
		},
		onEntityRemoved(entity) {
			characterState = characterState.returnEntity(entity);
		}
	};
</script>

<CharacterDetail
	{character}
	{characterState}
	{entityManager}
	onFilterClick={handleFilterClick}
	cardSetsLayout="single-column"
>
	{#snippet toolbarActions()}
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
		{#if !character.newestRevision.finalised}
			<ToolbarButton
				icon="finalize.svg"
				label={{ ca: 'Finalitzar', es: 'Finalizar', en: 'Finalize' }}
			/>
		{/if}

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
			dimUnavailableEntities={true}
			{entityManager}
		/>
	{/snippet}
</CharacterDetail>
