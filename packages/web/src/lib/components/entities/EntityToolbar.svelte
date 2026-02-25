<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { entityUrl } from '$lib/urls';
	import type { Entity } from '@songsofdoom/game';
	import { tick } from 'svelte';
	import ImpedimentMessage from '../impediments/ImpedimentMessage.svelte';
	import Toolbar from '../toolbar/Toolbar.svelte';
	import ToolbarButton from '../toolbar/ToolbarButton.svelte';
	import type { EntityManager } from './entitymanager';

	interface Props extends StandardAttributeProps {
		entity: Entity;
		entityManager: EntityManager;
	}

	const { entity, entityManager, ...attributes }: Props = $props();
	const acquisitionImpediment = $derived(entityManager.getAcquisitionImpediment(entity));
	const removalImpediment = $derived(entityManager.getRemovalImpediment(entity));

	let toolbarElement: HTMLElement | undefined;

	/**
	 * Handles entity addition and manages focus after the operation
	 */
	const handleAdd = async () => {
		entityManager.onEntityAdded(entity);
		await tick();

		// If add button is now disabled, move focus to next available button
		if (entityManager.getAcquisitionImpediment(entity)) {
			moveFocusToNextButton();
		}
	};

	/**
	 * Handles entity removal and manages focus after the operation
	 */
	const handleRemove = async () => {
		entityManager.onEntityRemoved(entity);
		await tick();

		// If remove button is now disabled, move focus to next available button
		if (entityManager.getRemovalImpediment(entity)) {
			moveFocusToNextButton();
		}
	};

	/**
	 * Moves focus to the first available (non-disabled) button or link in the toolbar
	 */
	const moveFocusToNextButton = () => {
		if (!toolbarElement) return;

		const firstAvailable = toolbarElement.querySelector<HTMLElement>('button:not(:disabled), a');

		if (firstAvailable) {
			firstAvailable.focus({ preventScroll: true });
		}
	};
</script>

<div bind:this={toolbarElement}>
	<Toolbar {...standardAttributes(attributes, 'entity-toolbar')}>
		<ToolbarButton
			icon="add.svg"
			onclick={handleAdd}
			label={{ ca: 'Afegir', es: 'Añadir', en: 'Add' }}
			disabled={!!acquisitionImpediment}
		>
			{#snippet disabledReason()}
				{#if acquisitionImpediment}
					<ImpedimentMessage impediment={acquisitionImpediment} />
				{/if}
			{/snippet}
		</ToolbarButton>
		<ToolbarButton
			icon="remove.svg"
			onclick={handleRemove}
			label={{ ca: 'Eliminar', es: 'Eliminar', en: 'Remove' }}
			disabled={!!removalImpediment}
		>
			{#snippet disabledReason()}
				{#if removalImpediment}
					<ImpedimentMessage impediment={removalImpediment} />
				{/if}
			{/snippet}
		</ToolbarButton>
		<ToolbarButton
			icon="open.svg"
			href={entityUrl.get(entity)}
			label={{ ca: 'Obrir', es: 'Abrir', en: 'Open' }}
		/>
	</Toolbar>
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;
</style>
