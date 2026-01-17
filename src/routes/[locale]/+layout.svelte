<script lang="ts">
	import { page } from '$app/state';
	import { getDocumentTitle } from '../../meta.js';
	import { setLocale } from '$lib/context/locale';
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	let { data, children } = $props();
	setLocale(data.locale);
</script>

<svelte:head>
	<title>{getDocumentTitle(page.data.title)}</title>
</svelte:head>

<header>
	<InlineSvg class="game-logo" src="logo.svg" style="height: 10rem;" />
	<h1 class="pageTitle">{page.data.title}</h1>
</header>

{@render children()}

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.pageTitle {
		font-family: var(--heading-font);
		font-size: 2rem;
	}

	header {
		margin-bottom: rz.size(lg);
	}
</style>
