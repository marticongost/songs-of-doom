import { Ally } from '../../models/entities/ally';
import { Action } from '../../models/capabilities';
import { fullyRechargeOnChapterStart } from '../../models/common';
import { attack, wound } from '../../models/effects';
import { will } from '../../models/stats';
import follower from '../properties/follower';
import magic from '../properties/magic';
import piercing from '../properties/piercing';

export default new Ally({
	title: {
		ca: 'Mag embogit',
		es: 'Mago enloquecido',
		en: 'Mad Wizard'
	},
	properties: [follower],
	stats: {
		strength: 2,
		agility: 2,
		intelligence: 4,
		charisma: 2,
		will: 4,
		health: 4,
		sanity: 6
	},
	maxCharges: 2,
	capabilities: [
		fullyRechargeOnChapterStart,
		new Action({
			cost: {
				charges: 1,
				charisma: 1
			},
			effects: [
				attack({
					expression: will,
					properties: [magic, piercing.with({ value: 1 })],
					results: {
						CF: [
							wound({
								damage: 2,
								target: 'owner',
								properties: [magic, piercing.with({ value: 1 })]
							})
						],
						1: 2,
						2: 4,
						3: 6
					}
				})
			]
		})
	]
});
