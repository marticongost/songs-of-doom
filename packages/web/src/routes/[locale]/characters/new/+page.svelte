<script lang="ts">
	import CreateCharacterForm from '$lib/components/characters/CreateCharacterForm.svelte';
	import type { ActionData } from './$types';

	const { form }: { form: ActionData } = $props();
</script>

<CreateCharacterForm class="create-character-form" errorMessage={form?.message} autofocus />

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	:global(.create-character-form) {
		width: 30em;
	}
</style>
