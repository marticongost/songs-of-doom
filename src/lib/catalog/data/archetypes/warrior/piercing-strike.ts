import { EphemeralPropertiesEffect } from '$lib/catalog/models/effects';
import { Opportunity } from '$lib/catalog/models/reaction';
import { Skill } from '$lib/catalog/models/skill';
import piercing from '../../properties/piercing';

export default new Skill({
	title: {
		ca: 'Atac penetrant',
		es: 'Ataque penetrante',
		en: 'Piercing strike'
	},
	xpCost: 0,
	discardReward: {
		agility: 2
	},
	capabilities: [
		new Opportunity({
			triggers: ['attacking'],
			cost: { agility: 1 },
			effects: [
				new EphemeralPropertiesEffect({
					grantedProperties: [piercing.with({ value: 2 })]
				})
			]
		})
	]
});
