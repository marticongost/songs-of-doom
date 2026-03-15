import { Action } from '../../../models/capabilities';
import {
	ConferPropertiesEffect,
	ModifyCapabilityCostEffect,
	ModifyRollEffect,
	TriggerAttackEffect
} from '../../../models/effects';
import { engaged, not } from '../../../models/expressions';
import { Skill } from '../../../models/entities/skill';
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
			cost: { intelligence: 1, agility: 1 },
			effects: [
				not(engaged).then(
					new TriggerAttackEffect({
						card: { condition: not(projectile) },
						modifiers: [
							new ModifyCapabilityCostEffect({ cost: { any: -2 } }),
							new ModifyRollEffect({ modifier: variants.level }),
							new ConferPropertiesEffect({
								properties: [piercing.with({ value: variants.level + 1 })]
							})
						]
					})
				)
			]
		})
	]
}));
