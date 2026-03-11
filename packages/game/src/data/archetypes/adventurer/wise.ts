import { Constant } from '../../../models/capabilities';
import { ChangeStatsEffect } from '../../../models/effects';
import { Trait } from '../../../models/trait';

export default new Trait({
	title: {
		ca: 'Saviesa',
		es: 'Sabiduría',
		en: 'Wisdom'
	},
	xpCost: 4,
	capabilities: [
		new Constant({
			effects: [new ChangeStatsEffect({ intelligence: 1 })]
		})
	]
});
