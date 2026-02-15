<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import { setLocale } from '$lib/context/locale';
	import { getDocumentTitle } from '../../../meta';

	let { data, children } = $props();
	setLocale(() => data.locale);

	const homePath = '/[locale]' as const;
</script>

<svelte:head>
	<title>{getDocumentTitle(page.data.title)}</title>
</svelte:head>

<div class="auth-layout">
	<header>
		<a href={resolve(homePath, { locale: data.locale })}>
			<InlineSvg class="game-logo" src="logo.svg" />
		</a>
	</header>

	<main class="auth-main">
		<h1 class="page-title">{page.data.title}</h1>
		{@render children()}
	</main>
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.auth-layout {
		min-height: 100vh;
		@include rz.column(xl);
		align-items: center;
		padding-top: rz.size(xl);
	}

	:global(.game-logo) {
		height: 5em;
	}

	.auth-main {
		@include rz.column(lg);
		width: min(400px, 90vw);
		background: var(--panel-background-color);
		border: var(--panel-border);
		border-radius: rz.size(sm);
		@include rz.padding(lg);
	}

	:global(.page-title) {
		font-family: var(--heading-font);
		font-size: 2rem;
		color: var(--text-heading-color);
		text-align: center;
		margin: 0;
	}
</style>
