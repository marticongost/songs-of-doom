import { Constant } from '../../../models/capabilities';
import { ChangeStatsEffect } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';
import { flaw, innate, permanent } from '../../properties';

export default new Trait({
	title: { en: 'Slow-Witted', es: 'Estúpido', ca: 'Estúpid' },
	xpCost: -3,
	properties: [flaw, innate, permanent],
	capabilities: [
		new Constant({
			effects: [new ChangeStatsEffect({ intelligence: -1 })]
		})
	]
});
