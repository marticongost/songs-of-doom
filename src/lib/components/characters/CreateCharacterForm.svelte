<!--
	@component
	A form for creating a new character.
	Posts to the current page and displays error messages on failure.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/forms/Input.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';

	interface Props extends StandardAttributeProps {
		/** Error message to display, if any */
		errorMessage?: string;

		/** Whether to autofocus the name field */
		autofocus?: boolean;
	}

	const { errorMessage, autofocus = false, ...attributes }: Props = $props();
</script>

<form {...standardAttributes(attributes, 'create-character-form')} method="POST" use:enhance>
	{#if errorMessage}
		<div class="error-message">{errorMessage}</div>
	{/if}

	<div class="form-field">
		<label for="name">
			<Text ca="Nom del personatge" es="Nombre del personaje" en="Character name" />
		</label>
		<Input {autofocus} id="name" name="name" required minlength={2} />
	</div>

	<Button type="submit">
		<Text ca="Crear" es="Crear" en="Create" />
	</Button>
</form>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.create-character-form {
		@include rz.column(md);
	}

	.form-field {
		@include rz.column(xs);

		label {
			font-weight: bold;
			color: var(--text-heading-color);
		}
	}

	.error-message {
		@include rz.padding(sm md);
		background: rgba(161, 85, 85, 0.2);
		border: 1px solid var(--stat-health-color);
		border-radius: rz.size(xs);
		color: var(--stat-health-color);
	}
</style>
