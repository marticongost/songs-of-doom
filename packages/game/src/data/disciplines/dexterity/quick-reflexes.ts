import { Constant, Opportunity } from '../../../models/capabilities';
import { changeStats, defend } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';
import { reactivePlayerIsTarget } from '../../../models/expressions';

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
				changeStats({
					agility: 1
				})
			]
		}),
		new Opportunity({
			triggers: [{ event: 'attack', condition: reactivePlayerIsTarget }],
			cost: { agility: 1 },
			effects: [
				defend({
					expression: 1
				})
			]
		})
	]
});
