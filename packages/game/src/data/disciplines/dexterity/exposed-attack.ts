import { Action } from '../../../models/capabilities';
import { modifyDamage, modifyRoll, resultsTable, triggerAttack } from '../../../models/effects';
import { receiveOpportunityAttacks } from '../../../models/effects/receiveopportunityattacks';
import { Skill } from '../../../models/entities/skill';
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
				triggerAttack({
					modifiers: [
						resultsTable({
							entries: [
								{
									result: '1+',
									effects: [modifyDamage(2)]
								},
								{
									result: 0,
									effects: [
										receiveOpportunityAttacks({
											effects: [modifyRoll(variants.values(2, 1))]
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
