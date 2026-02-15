import { Action } from '../../../models/capabilities';
import { fullyRechargeOnChapterStart, shootBeforeEngaged } from '../../../models/common';
import { AttackEffect } from '../../../models/effects';
import { plus } from '../../../models/expressions';
import { Item } from '../../../models/inventory';
import { agility } from '../../../models/stats';
import projectile from '../../properties/projectile';
import weapon from '../../properties/weapon';

export default new Item({
	title: {
		ca: 'Arc de caça',
		es: 'Arco de caza',
		en: 'Hunting bow'
	},
	slot: 'two-hands',
	goldCost: 3,
	properties: [weapon, projectile],
	maxCharges: 3,
	capabilities: [
		fullyRechargeOnChapterStart,
		shootBeforeEngaged,
		new Action({
			cost: { agility: 1, charges: 1 },
			effects: [
				new AttackEffect({
					expression: plus(agility, 1),
					results: { 1: 2, 2: 3, 3: 5 }
				})
			]
		})
	]
});
