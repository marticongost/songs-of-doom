<script lang="ts" module>
	import * as css from '$lib/styles';

	import pageHeaderUrl from '$lib/assets/img/page-header.png?url';

	const styles = css.styles({
		gameLogo: {
			height: '5em',
			alignSelf: 'center'
		},
		header: {
			...css.row('xl'),
			...css.hpadding('md'),
			backgroundImage: `
				linear-gradient(
					to bottom,
					color-mix(in srgb, ${css.site.headerBackgroundColor} 80%, transparent),
					color-mix(in srgb, ${css.site.pageBackgroundColor} 80%, transparent)
				),
				linear-gradient(to bottom, transparent, ${css.site.pageBackgroundColor}),
				url('${pageHeaderUrl}')`,
			backgroundSize: '100% 100%,	100% 100%, 128px',
			backgroundPosition: 'center, center, center top'
		},
		appControls: {
			'--svg-height': '1.5em',
			marginLeft: 'auto',
			alignSelf: 'center'
		},
		main: {
			...css.hpadding('md'),
			paddingTop: css.spacing.md
		},
		pageHeading: {
			...css.row('md'),
			alignItems: 'center',
			marginBottom: css.spacing.lg
		},
		pageTitle: {
			fontFamily: css.fonts.heading,
			fontSize: '3rem',
			color: css.text.headingColor
		}
	});
</script>

<script lang="ts">
	import { page } from '$app/state';
	import UserButton from '$lib/components/auth/UserButton.svelte';
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import LanguageButton from '$lib/components/LanguageButton.svelte';
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

<header class={styles.header}>
	<InlineSvg class={styles.gameLogo} src="logo.svg" />
	<Navigation
		root={siteTree}
		includeRoot={true}
		currentPath={getSectionPathName(page.url.pathname, data.locale)}
	/>
	<div class={styles.appControls}>
		<LanguageButton class="language-button" />
		<UserButton class="user-button" user={data.user ?? null} />
	</div>
</header>

<main class={styles.main}>
	{#if page.data.heading !== null}
		<div class={styles.pageHeading}>
			{#if page.data.heading}
				{@const Heading = page.data.heading}
				<Heading />
			{:else}
				<h1 class={styles.pageTitle}>{page.data.title}</h1>
			{/if}
		</div>
	{/if}
	{@render children()}
</main>
