import { Constant } from '../../../models/capabilities';
import { ChangeStatsEffect } from '../../../models/effects';
import { Trait } from '../../../models/trait';

export default new Trait({
	title: {
		ca: 'Forma física',
		es: 'Forma física',
		en: 'In good shape'
	},
	xpCost: 4,
	capabilities: [
		new Constant({
			effects: [new ChangeStatsEffect({ strength: 1 })]
		})
	]
});
