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
	import ErrorMessage from '../errors/ErrorMessage.svelte';

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
		<ErrorMessage>{errorMessage}</ErrorMessage>
	{/if}

	<div class="form-field">
		<label for="name">
			<Text ca="Nom" es="Nombre" en="Name" />
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
</style>
