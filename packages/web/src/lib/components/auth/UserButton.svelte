<!--
	@component
	An icon button that opens a popover with login form or user details.
	Shows a user icon that, when clicked, displays either user details with logout
	(if authenticated) or a login form (if not authenticated).
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		userButton: {
			display: 'inline-block'
		},
		loggedInCue: {
			position: 'absolute',
			positionAnchor: '--user-popover',
			positionArea: 'x-end y-end',
			borderRadius: '100%',
			backgroundColor: 'var(--positive-color)',
			width: css.spacing.sm,
			height: css.spacing.sm,
			top: '-0.5em'
		}
	});
</script>

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

<div {...standardAttributes(attributes, styles.userButton)}>
	<IconButton src="user.svg" popovertarget={popoverId} anchor={anchorName} />
	{#if user}
		<div class={styles.loggedInCue}></div>
	{/if}
	<Popover id={popoverId} class="user-popover" anchor={anchorName}>
		{#if user}
			<LoggedUserDetails {user} onSuccess={closePopover} />
		{:else}
			<LoginForm onSuccess={closePopover} />
		{/if}
	</Popover>
</div>
