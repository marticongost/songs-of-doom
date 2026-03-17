import { Action } from '../../../models/capabilities';
import { heal } from '../../../models/effects';
import { Skill } from '../../../models/entities/skill';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Primers auxilis',
		es: 'Primeros auxilios',
		en: 'First aid'
	},
	xpCost: variants.values(0, 1),
	discardReward: {
		any: 1
	},
	capabilities: [
		new Action({
			cost: {
				intelligence: 2
			},
			effects: [heal(variants.values(2, 3))]
		})
	]
}));
