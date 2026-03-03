import { Action } from '../../../models/capabilities';
import {
	EquipEffect,
	ModifyCapabilityCostEffect,
	ModifyRollEffect,
	TriggerAttackEffect
} from '../../../models/effects';
import { Skill } from '../../../models/skill';
import { upgradable } from '../../../models/upgrades';
import { smallWeapon } from '../../properties';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Arma amagada',
		es: 'Arma oculta',
		en: 'Concealed weapon'
	},
	xpCost: variants.values(0, 2),
	discardReward: { agility: variants.level },
	capabilities: [
		new Action({
			cost: { intelligence: 1 },
			effects: [
				new EquipEffect({ target: { type: 'object', variable: 'X', condition: smallWeapon } }),
				new TriggerAttackEffect({
					card: { variable: 'X' },
					modifiers: [
						new ModifyCapabilityCostEffect({ cost: { any: -2 } }),
						new ModifyRollEffect({ modifier: 1 })
					]
				})
			]
		})
	]
}));
