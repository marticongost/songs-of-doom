import { Action } from '../../../models/capabilities';
import { sameLocation } from '../../../models/common';
import { WoundEffect } from '../../../models/effects';
import { Skill } from '../../../models/entities';
import { upgradable } from '../../../models/upgrades';
import { holy, piercing } from '../../properties';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Flama purificadora',
		es: 'Llama purificadora',
		en: 'Cleansing flame'
	},
	xpCost: variants.values(0, 1),
	discardReward: {
		will: variants.level
	},
	capabilities: [
		new Action({
			cost: { will: 3 },
			effects: [
				new WoundEffect({
					damage: variants.values(2, 3),
					properties: [piercing.with({ value: 1 }), holy],
					target: {
						cardinality: 'every',
						type: 'enemy',
						condition: sameLocation
					}
				})
			]
		})
	]
}));
