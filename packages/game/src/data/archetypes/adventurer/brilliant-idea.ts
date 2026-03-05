import { Opportunity } from '../../../models/capabilities';
import { ModifyGatheredCluesEffect, ResultsTableEffect } from '../../../models/effects';
import { Skill } from '../../../models/skill';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Idea brillant',
		es: 'Idea brillante',
		en: 'Brilliant Idea'
	},
	xpCost: variants.values(0, 1),
	discardReward: { intelligence: variants.values(1, 2) },
	capabilities: [
		new Opportunity({
			triggers: ['investigating'],
			cost: { intelligence: 1 },
			effects: [
				new ResultsTableEffect({
					[variants.values('3', '2+')]: [new ModifyGatheredCluesEffect({ amount: 1 })]
				})
			]
		})
	]
}));
