import { Item } from '$lib/catalog/models/inventory';
import weapon from '../../properties/weapon';

export default new Item({
	title: { ca: 'Destral', es: 'Hacha', en: 'Axe' },
	slot: 'hand',
	properties: [weapon],
	capabilities: []
});
