<!--
@component
Displays the current user's username with a logout button, or a login link if not authenticated.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import Text from '$lib/components/localisation/Text.svelte';
	import { getLocale } from '$lib/context/locale';
	import type { SessionUser } from '$lib/server/auth';
	import Button from '../Button.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		/** The current user, or null if not authenticated */
		user: SessionUser | null;
	}

	const { user, ...rest }: Props = $props();
	const locale = getLocale();

	const loginPath = '/[locale]/auth/login' as const;
	const logoutPath = '/[locale]/auth/logout' as const;
</script>

<div {...standardAttributes(rest, 'user-menu')}>
	{#if user}
		<span class="username">{user.username}</span>
		<form method="POST" action={resolve(logoutPath, { locale })} use:enhance>
			<Button type="submit">
				<Text ca="Sortir" es="Salir" en="Log out" />
			</Button>
		</form>
	{:else}
		<Button href={resolve(loginPath, { locale })}>
			<Text ca="Entrar" es="Entrar" en="Log in" />
		</Button>
	{/if}
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.user-menu {
		@include rz.row(sm);
		align-items: center;
	}

	.username {
		color: var(--text-subtle-color);
		font-weight: bold;
	}
</style>
