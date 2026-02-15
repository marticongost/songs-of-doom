import { Action } from '../../../models/capabilities';
import {
	engage,
	ModifyCapabilityCostEffect,
	ModifyDamageEffect,
	ModifyRollEffect,
	TriggerAttackEffect
} from '../../../models/effects';
import { engaged, not } from '../../../models/expressions';
import { Skill } from '../../../models/skill';
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
					engage,
					new TriggerAttackEffect({
						modifiers: [
							new ModifyRollEffect({ modifier: 2 }),
							...variants.ifMatches(2, new ModifyDamageEffect({ amount: 1 })),
							new ModifyCapabilityCostEffect({ cost: { strength: -2 } })
						]
					})
				)
			]
		})
	]
}));
