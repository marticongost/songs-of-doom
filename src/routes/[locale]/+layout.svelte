<script lang="ts">
	import { page } from '$app/state';
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import { setLocale } from '$lib/context/locale';
	import { getSectionPathName, siteTree } from '$lib/navigation.js';
	import { getDocumentTitle } from '../../meta.js';
	let { data, children } = $props();
	setLocale(() => data.locale);
</script>

<svelte:head>
	<title>{getDocumentTitle(page.data.title)}</title>
</svelte:head>

<header>
	<InlineSvg class="game-logo" src="logo.svg" />
	<Navigation
		root={siteTree}
		includeRoot={true}
		currentPath={getSectionPathName(page.url.pathname, data.locale)}
	/>
</header>

<h1 class="page-title">{page.data.title}</h1>

{@render children()}

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	:global(.game-logo) {
		height: 8em;
	}

	.page-title {
		font-family: var(--heading-font);
		font-size: 3rem;
		margin-bottom: rz.size(lg);
	}

	header {
		@include rz.row(xl);
		margin-bottom: rz.size(xl);
	}
</style>
