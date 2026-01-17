<script lang="ts">
	import '$lib/css/global.scss';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { getDocumentTitle } from '../meta';
	import { setLocale } from '$lib/context/locale';
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	setLocale('ca');
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Amarante&family=Rosario:ital,wght@0,300..700;1,300..700&display=swap"
		rel="stylesheet"
	/>
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
