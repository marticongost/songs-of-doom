import { Opportunity } from '../../../models/capabilities';
import {
	modifyCapabilityCost,
	modifyDamage,
	modifyRoll,
	resultsTable,
	triggerAttack
} from '../../../models/effects';
import { Skill } from '../../../models/entities/skill';
import { effectiveDefense, gte, reactivePlayerIsTarget } from '../../../models/expressions';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Contraatac',
		es: 'Contraataque',
		en: 'Counter Attack'
	},
	xpCost: variants.values(0, 2),
	discardReward: { agility: 1, strength: variants.values(0, 1) },
	capabilities: [
		new Opportunity({
			id: 'activate',
			triggers: [{ event: 'attack', condition: reactivePlayerIsTarget }],
			cost: { agility: 1 },
			effects: [
				resultsTable({
					entries: [
						{
							result: 0,
							effects: [
								gte(effectiveDefense, 1).then(
									triggerAttack({
										modifiers: [
											modifyRoll({
												modifier: effectiveDefense
											}),
											...variants.ifMatches(2, modifyDamage(effectiveDefense)),
											modifyCapabilityCost({
												cost: {
													strength: -1,
													charges: -1
												}
											})
										]
									})
								)
							]
						}
					]
				})
			]
		})
	]
}));
