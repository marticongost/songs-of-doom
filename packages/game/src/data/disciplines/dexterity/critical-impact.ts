import { Opportunity } from '../../../models/capabilities';
import {
	ConferPropertiesEffect,
	ModifyDamageEffect,
	ResultsTableEffect
} from '../../../models/effects';
import { Skill } from '../../../models/entities/skill';
import { upgradable } from '../../../models/upgrades';
import { piercing } from '../../properties';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Impacte crític',
		es: 'Impacto crítico',
		en: 'Critical Impact'
	},
	xpCost: variants.values(0, 2),
	discardReward: { agility: 2 },
	capabilities: [
		new Opportunity({
			triggers: ['attacking'],
			cost: { agility: variants.values(2, 3) },
			effects: [
				new ResultsTableEffect({
					'3': [
						new ModifyDamageEffect({ amount: variants.values(2, 3) }),
						new ConferPropertiesEffect({ properties: [piercing.with({ value: variants.level })] })
					]
				})
			]
		})
	]
}));
