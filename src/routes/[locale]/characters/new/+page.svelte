<script lang="ts">
	import CreateCharacterForm from '$lib/components/characters/CreateCharacterForm.svelte';
	import type { ActionData } from './$types';

	const { form }: { form: ActionData } = $props();
</script>

<CreateCharacterForm errorMessage={form?.message} autofocus />
