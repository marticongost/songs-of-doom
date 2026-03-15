import { Action } from '../../../models/capabilities';
import { fullyRechargeOnChapterStart, shootBeforeEngaged } from '../../../models/common';
import { AttackEffect } from '../../../models/effects';
import { plus } from '../../../models/expressions';
import { Item } from '../../../models/entities/item';
import { agility } from '../../../models/stats';
import piercing from '../../properties/piercing';
import projectile from '../../properties/projectile';
import weapon from '../../properties/weapon';

export default new Item({
	title: {
		ca: 'Ballesta lleugera',
		es: 'Ballesta ligera',
		en: 'Light crossbow'
	},
	slot: 'two-hands',
	goldCost: 6,
	properties: [weapon, projectile],
	maxCharges: 2,
	capabilities: [
		fullyRechargeOnChapterStart,
		shootBeforeEngaged,
		new Action({
			cost: { agility: 1, strength: 1, charges: 1 },
			effects: [
				new AttackEffect({
					expression: plus(agility, 2),
					results: { 1: 3, 2: 4, 3: 5 },
					properties: [piercing.with({ value: 2 })]
				})
			]
		})
	]
});
