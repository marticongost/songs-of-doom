import { Action, Opportunity } from '../../../models/capabilities';
import { fullyRechargeOnChapterStart } from '../../../models/common';
import { AttackEffect, DefendEffect } from '../../../models/effects';
import { plus } from '../../../models/expressions';
import { Item } from '../../../models/entities/item';
import { strength } from '../../../models/stats';
import parry from '../../properties/parry';
import weapon from '../../properties/weapon';

export default new Item({
	title: { ca: 'Destral', es: 'Hacha', en: 'Axe' },
	slot: 'hand',
	properties: [weapon],
	maxCharges: 2,
	goldCost: 4,
	capabilities: [
		fullyRechargeOnChapterStart,
		new Action({
			cost: { strength: 1, charges: 1 },
			effects: [
				new AttackEffect({
					expression: plus(strength, 1),
					results: { 1: 2, 2: 3, 3: 5 }
				})
			]
		}),
		new Opportunity({
			cost: { charges: 1 },
			triggers: ['receivingAttack'],
			effects: [
				new DefendEffect({
					properties: [parry],
					expression: 1
				})
			]
		})
	]
});
