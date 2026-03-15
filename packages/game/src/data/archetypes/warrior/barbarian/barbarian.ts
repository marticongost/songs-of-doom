import { Archetype } from '../../../../models/entities/archetype';
import { Obligation } from '../../../../models/capabilities';
import { ModifyRollEffect } from '../../../../models/effects';

export default new Archetype({
	title: {
		ca: 'Bàrbar',
		es: 'Bárbaro',
		en: 'Barbarian'
	},
	xpCost: 5,
	capabilities: [
		new Obligation({
			triggers: ['attacking'],
			effects: [
				new ModifyRollEffect({
					modifier: 1
				})
			]
		}),
		new Obligation({
			triggers: ['receivingAttack'],
			effects: [
				new ModifyRollEffect({
					modifier: 1
				})
			]
		})
	]
});
