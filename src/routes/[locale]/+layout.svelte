<script lang="ts">
	import { page } from '$app/state';
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import { setLocale } from '$lib/context/locale';
	import { getDocumentTitle } from '../../meta.js';
	let { data, children } = $props();
	setLocale(data.locale);
</script>

<svelte:head>
	<title>{getDocumentTitle(page.data.title)}</title>
</svelte:head>

<header>
	<InlineSvg class="game-logo" src="logo.svg" style="height: 10rem;" />
</header>

<h1 class="page-title">{page.data.title}</h1>

{@render children()}

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.page-title {
		font-family: var(--heading-font);
		font-size: 3rem;
		margin-bottom: rz.size(lg);
	}

	header {
		margin-bottom: rz.size(xl);
	}
</style>
