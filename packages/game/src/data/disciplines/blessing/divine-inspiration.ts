import { Action } from '../../../models/capabilities';
import { gatherClues } from '../../../models/effects';
import { Skill } from '../../../models/entities';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Inspiració divina',
		es: 'Inspiración divina',
		en: 'Divine Inspiration'
	},
	xpCost: variants.values(0, 1),
	maxCharges: variants.values(2, 3),
	discardReward: {
		will: variants.level
	},
	capabilities: [
		new Action({
			id: 'activate',
			cost: { will: 2 },
			effects: [gatherClues({ amount: variants.values(1, 2) })]
		})
	]
}));
