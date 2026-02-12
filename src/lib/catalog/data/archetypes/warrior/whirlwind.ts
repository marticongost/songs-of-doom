import { Action } from '$lib/catalog/models/capabilities';
import {
	repeatCapability,
	ResultsTableEffect,
	TriggerAttackEffect
} from '$lib/catalog/models/effects';
import { AddChargesEffect } from '$lib/catalog/models/effects/recharge';
import type { ResultsTableEntryProps } from '$lib/catalog/models/effects/resultstable';
import { charges, plus } from '$lib/catalog/models/expressions';
import { Skill } from '$lib/catalog/models/skill';
import { upgradable } from '$lib/catalog/models/upgrades';

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
