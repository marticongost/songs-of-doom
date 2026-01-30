import { Action } from '$lib/catalog/models/action';
import { fullyRechargeOnChapterStart } from '$lib/catalog/models/common';
import { AttackEffect } from '$lib/catalog/models/effects';
import { plus } from '$lib/catalog/models/expressions';
import { Item } from '$lib/catalog/models/inventory';
import { agility } from '$lib/catalog/models/stats';
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
		new Action({
			cost: { agility: 1, strength: 1, charges: 1 },
			effects: [
				new AttackEffect({
					expression: plus(agility, 2),
					damage: { 1: 3, 2: 4, 3: 5 },
					properties: [piercing.with({ value: 2 })]
				})
			]
		})
	]
});
