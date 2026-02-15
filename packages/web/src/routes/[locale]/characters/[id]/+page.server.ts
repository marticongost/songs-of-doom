import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const characterId = parseInt(params.id, 10);

	if (isNaN(characterId)) {
		error(404, { message: 'Character not found' });
	}

	const character = await prisma.character.findUnique({
		where: { id: characterId },
		include: {
			owner: { select: { username: true } },
			revisions: {
				orderBy: { number: 'desc' },
				take: 1
			}
		}
	});

	if (!character) {
		error(404, { message: 'Character not found' });
	}

	return {
		title: character.name,
		character
	};
};
