import { Constant } from '../../../models/capabilities';
import { ChangeStatsEffect } from '../../../models/effects';
import { Trait } from '../../../models/trait';
import { flaw, innate } from '../../properties';

export default new Trait({
	title: { en: 'Cowardice', es: 'Cobardía', ca: 'Covardia' },
	xpCost: -3,
	properties: [innate, flaw],
	capabilities: [
		new Constant({
			effects: [new ChangeStatsEffect({ will: -1 })]
		})
	]
});
