import { locales } from '@songsofdoom/common/localisation';
import { redirect } from '@sveltejs/kit';

export function load() {
	redirect(303, '/' + locales[0]); // Redirect to the default locale
}
