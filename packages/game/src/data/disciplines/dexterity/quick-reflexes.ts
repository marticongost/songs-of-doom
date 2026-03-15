import { Constant, Opportunity } from '../../../models/capabilities';
import { ChangeStatsEffect, DefendEffect } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';

export default new Trait({
	title: {
		ca: 'Reflexos ràpids',
		es: 'Reflejos rápidos',
		en: 'Quick reflexes'
	},
	xpCost: 3,
	capabilities: [
		new Constant({
			effects: [
				new ChangeStatsEffect({
					agility: 1
				})
			]
		}),
		new Opportunity({
			triggers: ['receivingAttack'],
			cost: { agility: 1 },
			effects: [
				new DefendEffect({
					expression: 1
				})
			]
		})
	]
});
