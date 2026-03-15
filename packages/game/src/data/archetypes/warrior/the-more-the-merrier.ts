import { Opportunity } from '../../../models/capabilities';
import { DrawFocusEffect } from '../../../models/effects';
import { count, distance, eq, gte } from '../../../models/expressions';
import { Trait } from '../../../models/entities/trait';

export default new Trait({
	title: {
		ca: 'Com més serem...',
		es: 'Cuantos más, mejor',
		en: 'The more the merrier'
	},
	xpCost: 2,
	capabilities: [
		new Opportunity({
			triggers: ['chapterStart'],
			effects: [
				gte(count({ type: 'enemy', condition: eq(distance, 0) }), 2).then(
					new DrawFocusEffect({ amount: 1 })
				)
			]
		})
	]
});
