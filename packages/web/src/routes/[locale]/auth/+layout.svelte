<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		authLayout: {
			minHeight: '100vh',
			...css.column('xl'),
			alignItems: 'center',
			paddingTop: css.spacing.xl
		},
		gameLogo: {
			height: '5em'
		},
		authMain: {
			...css.column('lg'),
			width: 'min(400px, 90vw)',
			background: 'var(--panel-background-color)',
			border: 'var(--panel-border)',
			borderRadius: css.spacing.sm,
			padding: css.spacing.lg
		},
		pageTitle: {
			fontFamily: css.fonts.heading,
			fontSize: '2rem',
			color: css.text.headingColor,
			textAlign: 'center',
			margin: '0'
		}
	});
</script>

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

<div class={styles.authLayout}>
	<header>
		<a href={resolve(homePath, { locale: data.locale })}>
			<InlineSvg class={styles.gameLogo} src="logo.svg" />
		</a>
	</header>

	<main class={styles.authMain}>
		<h1 class={styles.pageTitle}>{page.data.title}</h1>
		{@render children()}
	</main>
</div>
