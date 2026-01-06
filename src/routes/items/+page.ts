import { items } from '$lib/catalog';
import { type Item } from '../../lib/catalog/models/inventory';

interface ServerPageData {
	rootItems: Array<Item>;
}

export const load = async ({ data }: { data: ServerPageData }) => {
	return { ...data, items: items.all() };
};
