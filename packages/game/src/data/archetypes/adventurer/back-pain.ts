import { Constant } from '../../../models/capabilities';
import { ModifyCarryingCapacityEffect } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';
import { flaw } from '../../properties';

export default new Trait({
	title: { ca: "Dolor d'esquena", es: 'Dolor de espalda', en: 'Back Pain' },
	xpCost: -2,
	properties: [flaw],
	capabilities: [
		new Constant({
			effects: [new ModifyCarryingCapacityEffect({ modifier: -1 })]
		})
	]
});
