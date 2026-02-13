<script lang="ts">
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<LoginForm errorMessage={form?.message} autofocus />
