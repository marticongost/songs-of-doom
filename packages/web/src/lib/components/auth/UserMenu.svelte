<!--
@component
Displays the current user's username with a logout button, or a login link if not authenticated.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		userMenu: {
			...css.row('sm'),
			alignItems: 'center'
		},
		username: {
			color: css.text.subtleColor,
			fontWeight: 'bold'
		}
	});
</script>

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

<div {...standardAttributes(rest, styles.userMenu)}>
	{#if user}
		<span class={styles.username}>{user.username}</span>
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
