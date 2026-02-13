<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/forms/Input.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<form method="POST" use:enhance class="auth-form">
	{#if form?.message}
		<div class="error-message">{form.message}</div>
	{/if}

	<div class="form-field">
		<label for="username">
			<Text ca="Nom d'usuari" es="Nombre de usuario" en="Username" />
		</label>
		<Input
			autofocus={true}
			id="username"
			name="username"
			autocomplete="username"
			required
			minlength={3}
			maxlength={31}
		/>
	</div>

	<div class="form-field">
		<label for="password">
			<Text ca="Contrasenya" es="Contraseña" en="Password" />
		</label>
		<Input
			type="password"
			id="password"
			name="password"
			autocomplete="current-password"
			required
			minlength={6}
		/>
	</div>

	<Button type="submit" class="submit-button">
		<Text ca="Entrar" es="Entrar" en="Log in" />
	</Button>
</form>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.auth-form {
		@include rz.column(md);
	}

	.form-field {
		@include rz.column(xs);

		label {
			font-weight: bold;
			color: var(--text-heading-color);
		}

		input {
			@include rz.padding(sm md);
			background: var(--page-background-color);
			border: var(--panel-border);
			border-radius: rz.size(xs);
			color: var(--text-color);
			font-size: 1rem;

			&:focus {
				outline: 2px solid var(--link-color);
				outline-offset: 2px;
			}
		}
	}

	.error-message {
		@include rz.padding(sm md);
		background: rgba(161, 85, 85, 0.2);
		border: 1px solid var(--stat-health-color);
		border-radius: rz.size(xs);
		color: var(--stat-health-color);
	}

	.submit-button {
		@include rz.padding(sm lg);
		background: var(--link-color);
		border: none;
		border-radius: rz.size(xs);
		color: white;
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		transition: background 0.2s;

		&:hover {
			background: var(--link-hover-color);
		}
	}
</style>
