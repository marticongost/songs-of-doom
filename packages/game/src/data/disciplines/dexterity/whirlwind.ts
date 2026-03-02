import { Action } from '../../../models/capabilities';
import { repeatCapability, ResultsTableEffect, TriggerAttackEffect } from '../../../models/effects';
import { AddChargesEffect } from '../../../models/effects/recharge';
import type { ResultsTableEntryProps } from '../../../models/effects/resultstable';
import { charges, plus } from '../../../models/expressions';
import { Skill } from '../../../models/skill';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: "Remolí d'atacs",
		es: 'Remolino de ataques',
		en: 'Whirlwind'
	},
	xpCost: variants.values(2, 3),
	discardReward: { agility: variants.values(2, 3) },
	capabilities: [
		new Action({
			cost: { agility: plus(1, charges) },
			effects: [
				new TriggerAttackEffect({
					modifiers: [
						new ResultsTableEffect({
							entries: [
								{
									result: variants.values('1+', '1-2'),
									effects: [new AddChargesEffect({ amount: 1 }), repeatCapability]
								},
								...variants.ifMatches(2, {
									result: 3,
									effects: [repeatCapability]
								} as ResultsTableEntryProps)
							]
						})
					]
				})
			]
		})
	]
}));
