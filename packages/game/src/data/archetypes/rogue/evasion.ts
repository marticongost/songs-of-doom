import { Opportunity } from '../../../models/capabilities';
import { DefendEffect } from '../../../models/effects';
import { Skill } from '../../../models/entities/skill';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Evasió',
		es: 'Evasión',
		en: 'Evasion'
	},
	xpCost: variants.values(0, 2),
	discardReward: { agility: variants.level },
	capabilities: [
		new Opportunity({
			triggers: ['receivingAttack'],
			cost: { agility: 1 },
			effects: [
				new DefendEffect({
					expression: variants.values(2, 3)
				})
			]
		})
	]
}));
