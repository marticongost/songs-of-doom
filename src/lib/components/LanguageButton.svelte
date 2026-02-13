<!--
	@component
	An icon button that opens a popover with language selection links.
	Shows a language icon that, when clicked, displays links to switch
	between supported locales while staying on the current page.
-->
<script lang="ts">
	import { page } from '$app/state';
	import IconButton from '$lib/components/IconButton.svelte';
	import Link from '$lib/components/Link.svelte';
	import Popover from '$lib/components/Popover.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { locales, type Locale } from '$lib/localisation';

	const { ...rest }: StandardAttributeProps = $props();

	const popoverId = 'language-popover';
	const anchorName = `--${popoverId}`;

	const localeNames: Record<Locale, string> = {
		ca: 'Català',
		es: 'Español',
		en: 'English'
	};

	function getLocaleHref(targetLocale: Locale): string {
		const currentLocale = page.params.locale as Locale;
		const pathname = page.url.pathname.replace(`/${currentLocale}`, `/${targetLocale}`);
		return pathname + page.url.search;
	}
</script>

<div {...standardAttributes(rest, 'language-button')}>
	<IconButton src="language.svg" popovertarget={popoverId} anchor={anchorName} />
	<Popover id={popoverId} class="language-popover" anchor={anchorName}>
		<ul class="locale-list">
			{#each locales as locale (locale)}
				<li class:current={locale === page.params.locale}>
					<Link href={getLocaleHref(locale)} data-sveltekit-reload>
						{localeNames[locale]}
					</Link>
				</li>
			{/each}
		</ul>
	</Popover>
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.language-button {
		display: inline-block;
	}

	.locale-list {
		@include rz.column(sm);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.current {
		font-weight: bold;
	}
</style>
