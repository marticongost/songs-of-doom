import { Action, Obligation } from '$lib/catalog/models/capabilities';
import {
	RemoveChargesEffect,
	RepeatCapabilityEffect,
	ResultsTableEffect,
	TriggerAttackEffect
} from '$lib/catalog/models/effects';
import { AddChargesEffect } from '$lib/catalog/models/effects/recharge';
import type { ResultsTableEntryProps } from '$lib/catalog/models/effects/resultstable';
import { charges } from '$lib/catalog/models/expressions';
import { plus } from '$lib/catalog/models/expressions/scalar-operation';
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
									result: '1+',
									effects: [new AddChargesEffect({ amount: 1 }), new RepeatCapabilityEffect()]
								},
								...variants.ifMatches(2, {
									result: 3,
									effects: [new RepeatCapabilityEffect()]
								} as ResultsTableEntryProps)
							]
						})
					]
				})
			]
		}),
		new Obligation({
			triggers: ['chapterEnd'],
			effects: [new RemoveChargesEffect({})]
		})
	]
}));
