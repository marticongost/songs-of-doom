import { ConferPropertiesEffect } from '$lib/catalog/models/effects';
import { Opportunity } from '$lib/catalog/models/reaction';
import { Skill } from '$lib/catalog/models/skill';
import { upgradable } from '$lib/catalog/models/upgrades';
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
