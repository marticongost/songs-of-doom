import { Action } from '../../../models/capabilities';
import {
	ModifyDamageEffect,
	ModifyRollEffect,
	ResultsTableEffect,
	TriggerAttackEffect
} from '../../../models/effects';
import { ReceiveOpportunityAttacksEffect } from '../../../models/effects/receiveopportunityattacks';
import { Skill } from '../../../models/skill';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Atac exposat',
		es: 'Ataque expuesto',
		en: 'Exposed attack'
	},
	xpCost: variants.values(0, 1),
	discardReward: {
		agility: variants.level
	},
	capabilities: [
		new Action({
			cost: { agility: 1 },
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
									effects: [
										new ReceiveOpportunityAttacksEffect({
											effects: [new ModifyRollEffect({ modifier: variants.values(2, 1) })]
										})
									]
								}
							]
						})
					]
				})
			]
		})
	]
}));
