<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { getDocumentTitle } from '../meta';
	import { setLocale } from '$lib/context/locale';
	setLocale("ca")
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Amarante&family=Rosario:ital,wght@0,300..700;1,300..700&display=swap" rel="stylesheet">
    <title>{ getDocumentTitle(page.data.title) }</title>
</svelte:head>

<style>
	:global(body) {
		--heading-font: 'Amarante', serif;
		--text-font: 'Rosario', sans-serif;
		font-family: var(--text-font);
	}

	.pageTitle {
		font-family: var(--heading-font);
		font-size: 2rem;
	}
</style>

<h1 class="pageTitle">{ page.data.title }</h1>

{@render children()}
