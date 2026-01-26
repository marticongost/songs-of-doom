import { Action } from '$lib/catalog/models/action';
import {
	RepeatCapabilityEffect,
	ResultsTableEffect,
	TriggerAttackEffect
} from '$lib/catalog/models/effects';
import { Skill } from '$lib/catalog/models/skill';

export default new Skill({
	title: {
		ca: "Remolí d'atacs",
		es: 'Remolino de ataques',
		en: 'Whirlwind'
	},
	xpCost: 2,
	discardReward: { agility: 2 },
	capabilities: [
		new Action({
			cost: { strength: 2, agility: 2 },
			effects: [
				new TriggerAttackEffect({
					modifiers: [
						new ResultsTableEffect({
							entries: [
								{
									result: '1+',
									effects: [new RepeatCapabilityEffect()]
								}
							]
						})
					]
				})
			]
		})
	]
});
