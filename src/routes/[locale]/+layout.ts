import { error } from '@sveltejs/kit';
import { locales, type Locale } from '$lib/localisation';

export function load({ params }: { params: { locale: Locale } }) {
	const locale = params.locale;

	if (!locales.includes(locale)) {
		error(404, 'Invalid locale');
	}

	return { locale };
}
