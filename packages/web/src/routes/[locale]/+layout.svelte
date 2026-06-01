<script lang="ts" module>
	import * as css from '$lib/styles';

	import pageHeaderUrl from '$lib/assets/img/page-header.png?url';

	const styles = css.styles({
		gameLogo: {
			height: '5em',
			alignSelf: 'center',
			...css.viewport.xs.then({
				position: 'absolute',
				height: '3em',
				left: css.site.smallScreenBleed,
				bottom: css.site.smallScreenBleed
			})
		},
		header: {
			...css.row('xl'),
			...css.hpadding(css.site.screenBleed),
			backgroundImage: `
				linear-gradient(
					to bottom,
					color-mix(in srgb, ${css.site.headerBackgroundColor} 80%, transparent),
					color-mix(in srgb, ${css.site.pageBackgroundColor} 80%, transparent)
				),
				linear-gradient(to bottom, transparent, ${css.site.pageBackgroundColor}),
				url('${pageHeaderUrl}')`,
			backgroundSize: '100% 100%,	100% 100%, 128px',
			backgroundPosition: 'center, center, center top',
			...css.viewport.xs.then({
				height: `calc(3em + ${css.site.smallScreenBleed} * 2)`,
				...css.hpadding(css.site.smallScreenBleed),
				justifyContent: 'center',
				gap: css.spacing.sm,
				borderTop: `4px solid ${css.site.headerBackgroundColor}`,
				backgroundSize: '100% 100%,	100% 100%, 64px',
				position: 'fixed',
				zIndex: 2,
				left: 0,
				right: 0,
				bottom: 0
			})
		},
		appControls: {
			'--svg-height': '1.5em',
			marginLeft: 'auto',
			alignSelf: 'center',
			...css.viewport.xs.then({
				position: 'absolute',
				right: css.site.smallScreenBleed,
				bottom: '50%',
				transform: 'translateY(50%)'
			})
		},
		main: {
			...css.hpadding(css.site.screenBleed),
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
	<svelte:boundary>
		{@render children()}
		{#snippet pending()}{/snippet}
	</svelte:boundary>
</main>
