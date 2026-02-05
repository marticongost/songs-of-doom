import { Action } from '$lib/catalog/models/action';
import {
	EngageEffect,
	ModifyCapabilityCostEffect,
	ModifyDamageEffect,
	ModifyRollEffect,
	TriggerAttackEffect
} from '$lib/catalog/models/effects';
import { engaged, not } from '$lib/catalog/models/expressions';
import { Skill } from '$lib/catalog/models/skill';
import { upgradable } from '$lib/catalog/models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: { ca: 'Carregar', es: 'Cargar', en: 'Charge' },
	xpCost: variants.values(0, 1),
	discardReward: { strength: 1, agility: variants.values(0, 1) },
	capabilities: [
		new Action({
			cost: { strength: 2 },
			effects: [
				not(engaged).then(
					new EngageEffect(),
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
