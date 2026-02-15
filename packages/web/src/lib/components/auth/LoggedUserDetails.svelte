<!--
	@component
	Displays the current user's username with a logout button.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { getLocale } from '$lib/context/locale';
	import type { SessionUser } from '$lib/server/auth';

	interface Props extends StandardAttributeProps {
		/** The current authenticated user */
		user: SessionUser;

		/** Called when logout succeeds */
		onSuccess?: () => void;
	}

	const { user, onSuccess, ...attributes }: Props = $props();
	const locale = getLocale();

	const logoutPath = '/[locale]/auth/logout' as const;
</script>

<div {...standardAttributes(attributes, 'logged-user-details')}>
	<span class="username">{user.username}</span>
	<form
		method="POST"
		action={resolve(logoutPath, { locale })}
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'redirect') {
					onSuccess?.();
				}
				await update();
			};
		}}
	>
		<Button type="submit">
			<Text ca="Sortir" es="Salir" en="Log out" />
		</Button>
	</form>
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.logged-user-details {
		@include rz.column(sm);
		align-items: center;
	}

	.username {
		color: var(--text-subtle-color);
		font-weight: bold;
	}
</style>
