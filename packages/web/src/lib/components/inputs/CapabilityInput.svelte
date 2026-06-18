<!--
@component Renders a list of capability choices for the player to select from.

Used by {@link InputForm} when the engine requests a capability choice via
a {@link CapabilityField}.
-->
<script lang="ts">
	import { getGameStore } from '$lib/context/gamestore';
	import { CapabilityField, type CapabilityRef } from '@songsofdoom/engine';
	import CapabilityChip from '../capabilities/CapabilityChip.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		/** The field definition from the engine, containing the set of available choices. */
		field: CapabilityField;

		/** Called when the user selects (or deselects) a capability. */
		onchange: (value: CapabilityRef | null) => void;

		/** The currently selected value, if any. */
		value?: CapabilityRef | null;
	}

	const { field, onchange, value = null, ...attributes }: Props = $props();
	const store = getGameStore();

	const choices: CapabilityRef[] = $derived([...field.choices]);
</script>

<div {...standardAttributes(attributes)}>
	{#each choices as choice (choice.capabilityId)}
		<button
			role="option"
			aria-selected={value === choice}
			onclick={() => onchange(value === choice ? null : choice)}
		>
			<CapabilityChip capability={store.gameState!.requireCapability(choice)} />
		</button>
	{/each}
</div>
