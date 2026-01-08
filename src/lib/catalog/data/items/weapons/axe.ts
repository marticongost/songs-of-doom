import { Action } from '$lib/catalog/models/action';
import { AttackEffect, DefendEffect } from '$lib/catalog/models/effects';
import { RechargeEffect } from '$lib/catalog/models/effects/recharge';
import { Item } from '$lib/catalog/models/inventory';
import { Reaction } from '$lib/catalog/models/reaction';
import parry from '../../properties/parry';
import weapon from '../../properties/weapon';

export default new Item({
	title: { ca: 'Destral', es: 'Hacha', en: 'Axe' },
	slot: 'hand',
	properties: [weapon],
	maxCharges: 2,
	capabilities: [
		new Reaction({
			triggers: ['chapterStart'],
			effects: [new RechargeEffect({ amount: 'max' })]
		}),
		new Action({
			cost: { strength: 1, charges: 1 },
			effects: [
				new AttackEffect({
					expression: 'strength+1',
					damage: { '1-2': 2, 3: 3, 4: 5 }
				})
			]
		}),
		new Reaction({
			cost: { agility: 1, charges: 1 },
			triggers: ['receivingAttack'],
			effects: [
				new DefendEffect({
					properties: [parry],
					expression: 'agility+1'
				})
			]
		})
	]
});
