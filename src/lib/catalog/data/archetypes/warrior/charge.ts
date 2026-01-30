import { Action } from '$lib/catalog/models/action';
import {
	EngageEffect,
	ModifyCapabilityCostEffect,
	ModifyRollEffect,
	TriggerAttackEffect
} from '$lib/catalog/models/effects';
import { engaged, not } from '$lib/catalog/models/expressions';
import { Skill } from '$lib/catalog/models/skill';

export default new Skill({
	title: { ca: 'Carregar', es: 'Cargar', en: 'Charge' },
	xpCost: 0,
	discardReward: { strength: 1 },
	capabilities: [
		new Action({
			cost: { strength: 2 },
			effects: [
				not(engaged).then(
					new EngageEffect(),
					new TriggerAttackEffect({
						modifiers: [
							new ModifyRollEffect({ modifier: 2 }),
							new ModifyCapabilityCostEffect({ cost: { strength: -2 } })
						]
					})
				)
			]
		})
	]
});
