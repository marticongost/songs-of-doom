import { traits } from '$lib/catalog';
import { type Trait } from '../../lib/catalog/models/trait';

interface ServerPageData {
	rootTraits: Array<Trait>;
}

export const load = async ({ data }: { data: ServerPageData }) => {
	return { ...data, rootTraits: traits.rootTraits() };
};
