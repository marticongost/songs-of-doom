import { Action } from '../../../models/capabilities';
import {
	ConferPropertiesEffect,
	ModifyDamageEffect,
	ModifyRollEffect,
	RecoverSanityEffect,
	ResultsTableEffect,
	TriggerAttackEffect
} from '../../../models/effects';
import { Skill } from '../../../models/entities';
import { upgradable } from '../../../models/upgrades';
import { holy } from '../../properties';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Mortificar',
		es: 'Mortificar',
		en: 'Smite'
	},
	xpCost: variants.values(0, 1),
	discardReward: {
		will: variants.level
	},
	capabilities: [
		new Action({
			cost: { will: 1 },
			effects: [
				new TriggerAttackEffect({
					modifiers: [
						new ModifyRollEffect({ modifier: 1 }),
						new ConferPropertiesEffect({ properties: [holy] }),
						new ResultsTableEffect({
							[variants.values('3', '2+')]: [
								new ModifyDamageEffect({ amount: 1 }),
								new RecoverSanityEffect({ amount: 1 })
							]
						})
					]
				})
			]
		})
	]
}));
