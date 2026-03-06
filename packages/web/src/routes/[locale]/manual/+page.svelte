<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const modules = import.meta.glob<{ default: ConstructorOfATypedSvelteComponent }>('./*.svelte');

	const manualPage = $derived(modules[`./${['manual', data.locale].join('-')}.svelte`]?.());
</script>

{#await manualPage then { default: ManualPage }}
	<ManualPage />
{/await}
