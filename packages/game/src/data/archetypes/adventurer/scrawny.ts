import { Constant } from '../../../models/capabilities';
import { ChangeStatsEffect } from '../../../models/effects';
import { Trait } from '../../../models/trait';
import { flaw, innate, permanent } from '../../properties';

export default new Trait({
	title: { en: 'Scrawny', es: 'Escuálido', ca: 'Escanyolit' },
	xpCost: -3,
	properties: [flaw, innate, permanent],
	capabilities: [
		new Constant({
			effects: [new ChangeStatsEffect({ strength: -1 })]
		})
	]
});
