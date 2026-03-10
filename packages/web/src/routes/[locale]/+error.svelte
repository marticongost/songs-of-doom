<!--
	@component
	Custom error page that handles authentication errors specially.
	When the error type is 'auth_required', displays a login form instead of a generic error.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		error: {
			...css.column('md'),
			textAlign: 'center'
		},
		errorTitle: {
			fontSize: '3rem',
			color: 'var(--stat-health-color)'
		}
	});
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
</script>

{#if $page.error?.type === 'auth_required'}
	<LoginForm autofocus />
{:else}
	<div class={styles.error}>
		<h1 class={styles.errorTitle}>{$page.status}</h1>
		<p>{$page.error?.message}</p>
	</div>
{/if}
