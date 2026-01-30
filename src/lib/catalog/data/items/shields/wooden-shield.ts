import { fullyRechargeOnChapterStart } from '$lib/catalog/models/common';
import { DefendEffect } from '$lib/catalog/models/effects';
import { plus } from '$lib/catalog/models/expression';
import { Item } from '$lib/catalog/models/inventory';
import { Opportunity } from '$lib/catalog/models/reaction';
import { agility } from '$lib/catalog/models/stats';
import shield from '../../properties/shield';

export default new Item({
	title: { ca: 'Escut de fusta', es: 'Escudo de madera', en: 'Wooden Shield' },
	slot: 'hand',
	properties: [shield],
	goldCost: 3,
	maxCharges: 2,
	capabilities: [
		fullyRechargeOnChapterStart,
		new Opportunity({
			triggers: ['receivingAttack'],
			cost: { charges: 1, agility: 1 },
			effects: [
				new DefendEffect({
					expression: plus(agility, 2)
				})
			]
		})
	]
});
