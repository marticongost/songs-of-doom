import { Constant } from '../../../models/capabilities';
import { modifyCarryingCapacity } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';
import { flaw } from '../../properties';

export default new Trait({
	title: { ca: "Dolor d'esquena", es: 'Dolor de espalda', en: 'Back Pain' },
	xpCost: -2,
	properties: [flaw],
	capabilities: [
		new Constant({
			id: 'passive',
			effects: [modifyCarryingCapacity(-1)]
		})
	]
});
