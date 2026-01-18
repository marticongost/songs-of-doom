import { fullyRechargeOnChapterStart } from '$lib/catalog/models/common';
import { DefendEffect } from '$lib/catalog/models/effects';
import { Item } from '$lib/catalog/models/inventory';
import { Opportunity } from '$lib/catalog/models/reaction';
import shield from '../../properties/shield';

export default new Item({
	title: { ca: 'Escut de fusta', es: 'Escudo de madera', en: 'Wooden Shield' },
	slot: 'hand',
	properties: [shield],
	maxCharges: 2,
	capabilities: [
		fullyRechargeOnChapterStart,
		new Opportunity({
			triggers: ['receivingAttack'],
			cost: { charges: 1, agility: 1 },
			effects: [
				new DefendEffect({
					expression: 'agility+2'
				})
			]
		})
	]
});
