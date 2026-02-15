<!--
	@component
	An icon button that opens a popover with login form or user details.
	Shows a user icon that, when clicked, displays either user details with logout
	(if authenticated) or a login form (if not authenticated).
-->
<script lang="ts">
	import IconButton from '$lib/components/IconButton.svelte';
	import Popover from '$lib/components/Popover.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { SessionUser } from '$lib/server/auth';
	import LoggedUserDetails from './LoggedUserDetails.svelte';
	import LoginForm from './LoginForm.svelte';

	interface Props extends StandardAttributeProps {
		/** The current user, or null if not authenticated */
		user: SessionUser | null;
	}

	const { user, ...attributes }: Props = $props();

	const popoverId = 'user-popover';
	const anchorName = `--${popoverId}`;

	function closePopover() {
		document.getElementById(popoverId)?.hidePopover();
	}
</script>

<div {...standardAttributes(attributes, 'user-button')}>
	<IconButton src="user.svg" popovertarget={popoverId} anchor={anchorName} />
	{#if user}
		<div class="logged-in-cue"></div>
	{/if}
	<Popover id={popoverId} class="user-popover" anchor={anchorName}>
		{#if user}
			<LoggedUserDetails {user} onSuccess={closePopover} />
		{:else}
			<LoginForm onSuccess={closePopover} />
		{/if}
	</Popover>
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.user-button {
		display: inline-block;
	}

	:global(.user-popover) {
		width: 20em;
	}

	.logged-in-cue {
		position: absolute;
		position-anchor: --user-popover;
		position-area: x-end y-end;
		border-radius: 100%;
		background-color: var(--positive-color);
		width: rz.size(sm);
		height: rz.size(sm);
		top: -0.5em;
	}
</style>
