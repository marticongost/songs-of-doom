import { Opportunity } from '../../../models/capabilities';
import { ConferPropertiesEffect } from '../../../models/effects';
import { Skill } from '../../../models/skill';
import { upgradable } from '../../../models/upgrades';
import piercing from '../../properties/piercing';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Atac penetrant',
		es: 'Ataque penetrante',
		en: 'Piercing strike'
	},
	xpCost: variants.values(0, 1),
	discardReward: {
		agility: 2,
		intelligence: variants.values(0, 1)
	},
	capabilities: [
		new Opportunity({
			triggers: ['attacking'],
			cost: { agility: 1 },
			effects: [
				new ConferPropertiesEffect({
					properties: [piercing.with({ value: variants.values(1, 2) })]
				})
			]
		})
	]
}));
