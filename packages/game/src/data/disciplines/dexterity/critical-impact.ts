import { Opportunity } from '../../../models/capabilities';
import { conferProperties, modifyDamage, resultsTable } from '../../../models/effects';
import { Skill } from '../../../models/entities/skill';
import { reactivePlayerIsSubject } from '../../../models/expressions';
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
			id: 'activate',
			triggers: [{ event: 'attack', condition: reactivePlayerIsSubject }],
			cost: { agility: variants.values(2, 3) },
			effects: [
				resultsTable({
					'3': [
						modifyDamage(variants.values(2, 3)),
						conferProperties({ properties: [piercing.with({ value: variants.level })] })
					]
				})
			]
		})
	]
}));
