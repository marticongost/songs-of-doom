import { reactiveCardIsSubject, reactivePlayerIsTarget } from '../../..';
import { Action, Constant, Obligation, Opportunity } from '../../../models/capabilities';
import {
	addCharges,
	attach,
	conferProperties,
	discard,
	negateDamage,
	oneOf,
	pay,
	removeCharges
} from '../../../models/effects';
import { Skill } from '../../../models/entities';
import { upgradable } from '../../../models/upgrades';
import { immobilized } from '../../properties';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Santuari',
		es: 'Santuario',
		en: 'Sanctuary'
	},
	xpCost: variants.values(0, 1),
	maxCharges: variants.values(2, 3),
	discardReward: {
		will: variants.level
	},
	capabilities: [
		new Action({
			id: 'attach',
			cost: { will: 2 },
			effects: [attach({}), addCharges(variants.values(2, 3))]
		})
	],
	attachmentCapabilities: [
		new Constant({
			id: 'immobilize',
			effects: [conferProperties([immobilized])]
		}),
		new Obligation({
			id: 'negateDamage',
			triggers: [{ event: 'damageDealt', condition: reactivePlayerIsTarget }],
			cost: { charges: 1 },
			effects: [negateDamage()]
		}),
		new Opportunity({
			id: 'discharge',
			triggers: ['chapterStart'],
			cost: { will: 1 },
			effects: [
				oneOf({
					effects: [pay({ cost: { will: 1 } }), removeCharges({ amount: 1 })]
				})
			]
		}),
		new Obligation({
			id: 'discardWhenFullyDischarged',
			triggers: [{ event: 'fullyDischarged', condition: reactiveCardIsSubject }],
			effects: [discard()]
		})
	]
}));
