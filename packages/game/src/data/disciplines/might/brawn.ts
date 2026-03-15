import { Constant } from '../../../models/capabilities';
import { ChangeStatsEffect } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';

export default new Trait({
	title: {
		ca: 'Corpulència',
		es: 'Corpulencia',
		en: 'Brawn'
	},
	xpCost: 3,
	capabilities: [
		new Constant({
			effects: [new ChangeStatsEffect({ strength: 1 })]
		})
	]
});
