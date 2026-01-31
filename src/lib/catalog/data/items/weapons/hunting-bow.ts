import { Action } from '$lib/catalog/models/action';
import { fullyRechargeOnChapterStart, shootBeforeEngaged } from '$lib/catalog/models/common';
import { AttackEffect } from '$lib/catalog/models/effects';
import { plus } from '$lib/catalog/models/expressions';
import { Item } from '$lib/catalog/models/inventory';
import { agility } from '$lib/catalog/models/stats';
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
					damage: { 1: 2, 2: 3, 3: 5 }
				})
			]
		})
	]
});
