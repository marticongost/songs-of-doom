<!--
	@component
	Custom error page that handles authentication errors specially.
	When the error type is 'auth_required', displays a login form instead of a generic error.
-->
<script lang="ts">
	import { page } from '$app/stores';
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
</script>

{#if $page.error?.type === 'auth_required'}
	<LoginForm autofocus />
{:else}
	<div class="error">
		<h1>{$page.status}</h1>
		<p>{$page.error?.message}</p>
	</div>
{/if}

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.error {
		@include rz.column(md);
		text-align: center;

		h1 {
			font-size: 3rem;
			color: var(--stat-health-color);
		}
	}
</style>
