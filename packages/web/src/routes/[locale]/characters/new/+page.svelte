<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		createCharacterForm: {
			width: '30em'
		}
	});
</script>

<script lang="ts">
	import CreateCharacterForm from '$lib/components/characters/CreateCharacterForm.svelte';
	import type { ActionData } from './$types';

	const { form }: { form: ActionData } = $props();
</script>

<CreateCharacterForm class={styles.createCharacterForm} errorMessage={form?.message} autofocus />
