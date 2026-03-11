import { Constant } from '../../../models/capabilities';
import { ChangeStatsEffect } from '../../../models/effects';
import { Trait } from '../../../models/trait';

export default new Trait({
	title: {
		ca: 'Coratge',
		es: 'Coraje',
		en: 'Grit'
	},
	xpCost: 4,
	capabilities: [
		new Constant({
			effects: [new ChangeStatsEffect({ will: 1 })]
		})
	]
});
