import { Action } from '../../../models/capabilities';
import { equip, modifyCapabilityCost, modifyRoll, triggerAttack } from '../../../models/effects';
import { Skill } from '../../../models/entities/skill';
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
			id: 'activate',
			cost: { intelligence: 1 },
			effects: [
				equip({ type: 'object', variable: 'X', condition: smallWeapon }),
				triggerAttack({
					card: { variable: 'X' },
					modifiers: [modifyCapabilityCost({ cost: { any: -2 } }), modifyRoll(1)]
				})
			]
		})
	]
}));
