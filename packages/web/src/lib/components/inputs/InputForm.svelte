<!--
@component Dispatches input fields from the engine to the appropriate UI component.

Reads input fields from the {@link GameStore} instance obtained via Svelte context
and renders a specialised input component for each field type, discriminated via
`instanceof`. Collects user input for all fields and submits them together.

Only fields whose corresponding input component has been implemented are rendered;
unknown field types show a fallback placeholder.
-->
<script lang="ts">
	import { getGameStore } from '$lib/context/gamestore';
	import {
		BooleanField,
		CapabilityField,
		EntityField,
		FocusesField,
		PaymentField,
		ResultField,
		TargetField,
		type CapabilityRef
	} from '@songsofdoom/engine';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import CapabilityInput from './CapabilityInput.svelte';

	interface Props extends StandardAttributeProps {
		/** Called when the user submits the collected input. */
		onsubmit?: (input: Record<string, unknown>) => void;
	}

	const { onsubmit, ...attributes }: Props = $props();

	const store = getGameStore();

	/** Accumulated values for each field, keyed by field name. */
	let values = $state<Record<string, unknown>>({});

	/** Whether a submission is currently in progress. */
	let submitting = $state(false);

	/** Initialise or reset values when the fields change. */
	$effect(() => {
		const next: Record<string, unknown> = {};
		for (const field of store.inputFields) {
			// Preserve existing value if the field is still present, otherwise reset.
			if (field.name in values) {
				next[field.name] = values[field.name];
			}
		}
		values = next;
	});

	function _handleChange(name: string, value: unknown) {
		values = { ...values, [name]: value };
	}

	function _canSubmit(): boolean {
		if (submitting) return false;
		if (store.inputFields.length === 0) return false;
		return store.inputFields.every((field) => !field.required || values[field.name] != null);
	}

	async function _submit() {
		if (!_canSubmit()) return;
		submitting = true;
		try {
			// Build the input payload, including only non-null values for required fields.
			const payload: Record<string, unknown> = {};
			for (const field of store.inputFields) {
				const v = values[field.name];
				if (v != null) {
					payload[field.name] = v;
				}
			}
			if (onsubmit) {
				onsubmit(payload);
			} else {
				await store.supplyInput(payload);
			}
		} finally {
			submitting = false;
		}
	}
</script>

<div {...standardAttributes(attributes)}>
	{#each store.inputFields as field (field.name)}
		<div class="field-input">
			{#if field instanceof CapabilityField}
				<CapabilityInput
					{field}
					value={values[field.name] as CapabilityRef | null}
					onchange={(v) => _handleChange(field.name, v)}
				/>
			{:else if field instanceof TargetField}
				<!-- TODO: 6.2 TargetFieldInput -->
				<div class="field-placeholder">TargetField — not yet implemented</div>
			{:else if field instanceof BooleanField}
				<!-- TODO: 6.4 BooleanFieldInput -->
				<div class="field-placeholder">BooleanField — not yet implemented</div>
			{:else if field instanceof EntityField}
				<!-- TODO: 6.5 EntityFieldInput -->
				<div class="field-placeholder">EntityField — not yet implemented</div>
			{:else if field instanceof FocusesField}
				<!-- TODO: 6.6 FocusesFieldInput -->
				<div class="field-placeholder">FocusesField — not yet implemented</div>
			{:else if field instanceof PaymentField}
				<!-- TODO: 6.7 PaymentFieldInput -->
				<div class="field-placeholder">PaymentField — not yet implemented</div>
			{:else if field instanceof ResultField}
				<!-- TODO: 6.8 ResultFieldInput -->
				<div class="field-placeholder">ResultField — not yet implemented</div>
			{:else}
				<div class="field-placeholder">
					Unknown field type: {field.constructor?.name ?? 'Field'}
				</div>
			{/if}
		</div>
	{/each}

	<div class="field-submit" role="button" aria-disabled={!_canSubmit()} onclick={() => _submit()}>
		Submit
	</div>
</div>
