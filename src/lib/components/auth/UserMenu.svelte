<!--
@component
Displays the current user's username with a logout button, or a login link if not authenticated.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { getLocale } from '$lib/context/locale';
	import Text from '$lib/components/localisation/Text.svelte';
	import type { SessionUser } from '$lib/server/auth';

	interface Props {
		/** The current user, or null if not authenticated */
		user: SessionUser | null;
	}

	const { user }: Props = $props();
	const locale = getLocale();

	const loginPath = '/[locale]/auth/login' as const;
	const logoutPath = '/[locale]/auth/logout' as const;
</script>

{#if user}
	<div class="user-menu">
		<span class="username">{user.username}</span>
		<form method="POST" action={resolve(logoutPath, { locale })} use:enhance>
			<button type="submit" class="logout-button">
				<Text ca="Surt" es="Salir" en="Log out" />
			</button>
		</form>
	</div>
{:else}
	<a href={resolve(loginPath, { locale })} class="login-link">
		<Text ca="Entra" es="Entrar" en="Log in" />
	</a>
{/if}

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

	.logout-button {
		background: transparent;
		border: 1px solid var(--text-subtle-color);
		border-radius: rz.size(xs);
		@include rz.padding(xs sm);
		color: var(--text-subtle-color);
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s;

		&:hover {
			border-color: var(--link-color);
			color: var(--link-color);
		}
	}

	.login-link {
		color: var(--link-color);
		font-weight: bold;

		&:hover {
			color: var(--link-hover-color);
		}
	}
</style>
