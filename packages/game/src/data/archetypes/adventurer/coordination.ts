import { Constant } from '../../../models/capabilities';
import { ChangeStatsEffect } from '../../../models/effects';
import { Trait } from '../../../models/trait';

export default new Trait({
	title: {
		ca: 'Coordinació',
		es: 'Coordinación',
		en: 'Coordination'
	},
	xpCost: 4,
	capabilities: [
		new Constant({
			effects: [new ChangeStatsEffect({ agility: 1 })]
		})
	]
});
