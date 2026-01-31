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

<main>
	<h1 class="page-title">{page.data.title}</h1>
	{@render children()}
</main>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	:global(body) {
		--page-hpadding: #{rz.size(md)};
	}

	:global(.game-logo) {
		height: 5em;
		align-self: center;
	}

	header {
		@include rz.row(xl);
		@include rz.hpadding(var(--page-hpadding));
		background-image: linear-gradient(
			to bottom,
			var(--header-background-color),
			var(--page-background-color)
		);
	}

	main {
		@include rz.hpadding(var(--page-hpadding));
		padding-top: rz.size(md);
		background-color: var(--page-background-color);
	}

	.page-title {
		font-family: var(--heading-font);
		font-size: 3rem;
		margin-bottom: rz.size(lg);
		color: var(--text-heading-color);
	}
</style>
