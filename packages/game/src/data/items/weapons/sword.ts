import { Action, Opportunity } from '../../../models/capabilities';
import { fullyRechargeOnChapterStart } from '../../../models/common';
import { AttackEffect, DefendEffect } from '../../../models/effects';
import { plus } from '../../../models/expressions';
import { Item } from '../../../models/inventory/item';
import { strength } from '../../../models/stats';
import parry from '../../properties/parry';
import weapon from '../../properties/weapon';

export default new Item({
	title: { ca: 'Espasa llarga', es: 'Espada larga', en: 'Longsword' },
	slot: 'hand',
	properties: [weapon],
	maxCharges: 3,
	goldCost: 5,
	capabilities: [
		fullyRechargeOnChapterStart,
		new Action({
			cost: { strength: 1, charges: 1 },
			effects: [
				new AttackEffect({
					expression: plus(strength, 1),
					results: { 1: 1, 2: 3, 3: 4 }
				})
			]
		}),
		new Action({
			cost: { agility: 1, strength: 1, charges: 1 },
			effects: [
				new AttackEffect({
					expression: plus(strength, 2),
					results: { 1: 2, 2: 4, 3: 5 }
				})
			]
		}),
		new Opportunity({
			cost: { charges: 1 },
			triggers: ['receivingAttack'],
			effects: [
				new DefendEffect({
					properties: [parry],
					expression: 2
				})
			]
		})
	]
});
