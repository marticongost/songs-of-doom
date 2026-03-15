import { Constant } from '../../../models/capabilities';
import { ChangeStatsEffect } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';

export default new Trait({
	title: {
		ca: 'Atractiu',
		es: 'Atractivo',
		en: 'Good-looking'
	},
	xpCost: 4,
	capabilities: [
		new Constant({
			effects: [new ChangeStatsEffect({ charisma: 1 })]
		})
	]
});
