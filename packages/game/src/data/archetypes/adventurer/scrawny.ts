import { Constant } from '../../../models/capabilities';
import { changeStats } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';
import { flaw, innate, permanent } from '../../properties';

export default new Trait({
	title: { en: 'Scrawny', es: 'Escuálido', ca: 'Escanyolit' },
	xpCost: -3,
	properties: [flaw, innate, permanent],
	capabilities: [
		new Constant({
			id: 'passive',
			effects: [changeStats({ strength: -1 })]
		})
	]
});
