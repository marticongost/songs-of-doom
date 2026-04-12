import { Opportunity } from '../../../models/capabilities';
import { conferProperties } from '../../../models/effects';
import { Skill } from '../../../models/entities/skill';
import { reactivePlayerIsSubject } from '../../../models/expressions';
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
			triggers: [{ event: 'attack', condition: reactivePlayerIsSubject }],
			cost: { agility: 1 },
			effects: [
				conferProperties({
					properties: [piercing.with({ value: variants.values(1, 2) })]
				})
			]
		})
	]
}));
