<!--
	@component
	A login form with username and password fields.
	Posts to the login endpoint and displays error messages on failure.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/forms/Input.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { getLocale } from '$lib/context/locale';

	interface Props extends StandardAttributeProps {
		/** Error message to display, if any */
		errorMessage?: string;

		/** Whether to autofocus the username field */
		autofocus?: boolean;

		/** Called when login succeeds */
		onSuccess?: () => void;
	}

	const { errorMessage, autofocus = false, onSuccess, ...attributes }: Props = $props();
	const locale = getLocale();

	const loginPath = '/[locale]/auth/login' as const;
</script>

<form
	{...standardAttributes(attributes, 'login-form')}
	method="POST"
	action={resolve(loginPath, { locale })}
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'redirect') {
				onSuccess?.();
			}
			await update();
		};
	}}
>
	{#if errorMessage}
		<div class="error-message">{errorMessage}</div>
	{/if}

	<div class="form-field">
		<label for="username">
			<Text ca="Nom d'usuari" es="Nombre de usuario" en="Username" />
		</label>
		<Input
			{autofocus}
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

	<Button type="submit">
		<Text ca="Entrar" es="Entrar" en="Log in" />
	</Button>
</form>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.login-form {
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
