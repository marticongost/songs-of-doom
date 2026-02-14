import { prisma } from '$lib/server/db';
import { translate, type Locale } from '$lib/localisation';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const locale = params.locale as Locale;

	const characters = await prisma.character.findMany({
		include: {
			owner: { select: { username: true } },
			revisions: {
				orderBy: { number: 'desc' },
				take: 1
			}
		}
	});

	return {
		title: translate({ ca: 'Personatges', es: 'Personajes', en: 'Characters' }, locale),
		characters
	};
};
