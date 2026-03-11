import { Constant } from '../../../models/capabilities';
import { ChangeStatsEffect } from '../../../models/effects';
import { Trait } from '../../../models/trait';

export default new Trait({
	title: { ca: 'Enginy', es: 'Ingenio', en: 'Cunning' },
	xpCost: 3,
	capabilities: [
		new Constant({
			effects: [new ChangeStatsEffect({ intelligence: 1 })]
		})
	]
});
