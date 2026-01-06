import { Item } from '$lib/catalog/models/inventory/item';
import weapon from '../../properties/weapon';

export default new Item({
	title: { ca: 'Espasa llarga', es: 'Espada larga', en: 'Longsword' },
	slot: 'hand',
	properties: [weapon],
	capabilities: []
});
