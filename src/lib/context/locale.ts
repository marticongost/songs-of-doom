import type { Locale } from '$lib/localisation';
import { setContext, getContext } from 'svelte';

const LOCALE_KEY = Symbol('locale');

export function setLocale(getLocale: () => Locale): void {
	setContext(LOCALE_KEY, getLocale);
}

export function getLocale(): Locale {
	return getContext<() => Locale>(LOCALE_KEY)();
}
