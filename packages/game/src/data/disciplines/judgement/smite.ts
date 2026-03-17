import { Action } from '../../../models/capabilities';
import {
	modifyDamage,
	modifyRoll,
	recoverSanity,
	replaceProperty,
	resultsTable,
	triggerAttack
} from '../../../models/effects';
import { Skill } from '../../../models/entities';
import { upgradable } from '../../../models/upgrades';
import { holy, physical } from '../../properties';

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
				triggerAttack({
					modifiers: [
						modifyRoll(1),
						replaceProperty({ original: physical, replacement: holy }),
						resultsTable({
							[variants.values('3', '2+')]: [modifyDamage(1), recoverSanity(1)]
						})
					]
				})
			]
		})
	]
}));
