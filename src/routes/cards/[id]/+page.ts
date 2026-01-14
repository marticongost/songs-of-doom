import { entities } from '$lib/catalog';
import { error } from '@sveltejs/kit';

export const load = async ({ params }: { params: { id: string } }) => {
	const entity = entities.get(params.id);
	if (!entity) {
		error(404, `Card '${params.id}' not found`);
	}
	return { entity };
};
