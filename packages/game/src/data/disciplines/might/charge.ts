import { Action } from '../../../models/capabilities';
import { sameLocation } from '../../../models/common';
import {
	engage,
	modifyCapabilityCost,
	modifyDamage,
	modifyRoll,
	triggerAttack
} from '../../../models/effects';
import { Skill } from '../../../models/entities/skill';
import { engaged, not } from '../../../models/expressions';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: { ca: 'Carregar', es: 'Cargar', en: 'Charge' },
	xpCost: variants.values(0, 1),
	discardReward: { strength: 1, agility: variants.values(0, 1) },
	capabilities: [
		new Action({
			cost: { strength: 2 },
			effects: [
				not(engaged).then(
					engage({ target: { type: 'enemy', condition: sameLocation } }),
					triggerAttack({
						modifiers: [
							modifyRoll(2),
							...variants.ifMatches(2, modifyDamage(1)),
							modifyCapabilityCost({ cost: { strength: -2 } })
						]
					})
				)
			]
		})
	]
}));
