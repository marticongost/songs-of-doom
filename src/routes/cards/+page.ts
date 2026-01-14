import { entities } from '$lib/catalog';
import type { Entity } from '$lib/catalog/models/entity';

interface ServerPageData {
	entities: Array<Entity>;
}

export const load = async ({ data }: { data: ServerPageData }) => {
	return { ...data, entities: entities.all() };
};
