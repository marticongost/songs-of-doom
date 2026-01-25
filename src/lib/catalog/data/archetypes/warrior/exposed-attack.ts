import { Action } from '$lib/catalog/models/action';
import {
	ModifyDamageEffect,
	ResultsTableEffect,
	TriggerAttackEffect
} from '$lib/catalog/models/effects';
import { ReceiveOpportunityAttacksEffect } from '$lib/catalog/models/effects/receiveopportunityattacks';
import { Skill } from '$lib/catalog/models/skill';

export default new Skill({
	title: {
		ca: 'Atac exposat',
		es: 'Ataque expuesto',
		en: 'Exposed attack'
	},
	xpCost: 0,
	discardReward: {
		agility: 1
	},
	capabilities: [
		new Action({
			effects: [
				new TriggerAttackEffect({
					modifiers: [
						new ResultsTableEffect({
							entries: [
								{
									result: '1+',
									effects: [new ModifyDamageEffect({ amount: 2 })]
								},
								{
									result: 0,
									effects: [new ReceiveOpportunityAttacksEffect({})]
								}
							]
						})
					]
				})
			]
		})
	]

	// TODO: atac +2, si falla, l'oponent ataca amb +1 sense cost
});
