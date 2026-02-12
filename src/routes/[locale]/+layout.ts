import { error } from '@sveltejs/kit';
import { locales, type Locale } from '$lib/localisation';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, data }) => {
	const locale = params.locale as Locale;

	if (!locales.includes(locale)) {
		error(404, 'Invalid locale');
	}

	return { locale, user: data.user };
};
