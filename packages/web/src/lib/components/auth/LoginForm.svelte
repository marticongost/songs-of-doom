<!--
	@component
	A login form with username and password fields.
	Posts to the login endpoint and displays error messages on failure.
-->

<script lang="ts" module>
	import * as css from '$lib/styles';
	import { cx } from '@emotion/css';

	const styles = css.styles({
		loginForm: {
			...css.column('md')
		},
		formField: {
			...css.column('xs'),
			label: {
				fontWeight: 'bold',
				color: css.text.headingColor
			}
		},
		errorMessage: {
			...css.vpadding('sm'),
			...css.hpadding('md'),
			background: 'rgba(161, 85, 85, 0.2)',
			border: `1px solid ${css.palette.red}`,
			borderRadius: css.spacing.xs,
			color: css.palette.red
		}
	});
</script>

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
	{...standardAttributes(attributes, cx('login-form', styles.loginForm))}
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
		<div class={styles.errorMessage}>{errorMessage}</div>
	{/if}

	<div class={styles.formField}>
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

	<div class={styles.formField}>
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
