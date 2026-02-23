<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { entityUrl } from '$lib/urls';
	import type { Entity } from '@songsofdoom/game';
	import Toolbar from '../toolbar/Toolbar.svelte';
	import ToolbarButton from '../toolbar/ToolbarButton.svelte';
	import type { EntityManager } from './entitymanager';

	interface Props extends StandardAttributeProps {
		entity: Entity;
		entityManager: EntityManager;
	}

	const { entity, entityManager, ...attributes }: Props = $props();
</script>

<Toolbar {...standardAttributes(attributes, 'entity-toolbar')}>
	<ToolbarButton
		icon="add.svg"
		onclick={() => entityManager.onEntityAdded(entity)}
		label={{ ca: 'Afegir', es: 'Añadir', en: 'Add' }}
	/>
	<ToolbarButton
		icon="remove.svg"
		onclick={() => entityManager.onEntityRemoved(entity)}
		label={{ ca: 'Eliminar', es: 'Eliminar', en: 'Remove' }}
	/>
	<ToolbarButton
		icon="open.svg"
		href={entityUrl.get(entity)}
		label={{ ca: 'Obrir', es: 'Abrir', en: 'Open' }}
	/>
</Toolbar>

<style lang="scss">
	@use '@reguitzell/styles' as rz;
</style>
