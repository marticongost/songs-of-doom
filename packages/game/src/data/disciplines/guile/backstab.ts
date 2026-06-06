import { Action } from '../../../models/capabilities';
import {
	conferProperties,
	modifyCapabilityCost,
	modifyRoll,
	triggerAttack
} from '../../../models/effects';
import { Skill } from '../../../models/entities/skill';
import { engaged, not } from '../../../models/expressions';
import { upgradable } from '../../../models/upgrades';
import { piercing, projectile } from '../../properties';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Apunyalar',
		es: 'Apuñalar',
		en: 'Backstab'
	},
	xpCost: variants.values(0, 2),
	discardReward: { agility: 1, intelligence: variants.level },
	capabilities: [
		new Action({
			id: 'activate',
			cost: { intelligence: 1, agility: 1 },
			effects: [
				not(engaged).then(
					triggerAttack({
						card: { condition: not(projectile) },
						modifiers: [
							modifyCapabilityCost({ cost: { any: -2 } }),
							modifyRoll(variants.level),
							conferProperties({
								properties: [piercing.with({ value: variants.level + 1 })]
							})
						]
					})
				)
			]
		})
	]
}));
