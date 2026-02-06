import { Opportunity } from '$lib/catalog/models/capabilities';
import { DrawFocusEffect } from '$lib/catalog/models/effects';
import { count, distance, eq, gte } from '$lib/catalog/models/expressions';
import { Trait } from '$lib/catalog/models/trait';

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
				gte(count({ type: 'allEnemies', condition: eq(distance, 0) }), 2).then(
					new DrawFocusEffect({ amount: 1 })
				)
			]
		})
	]
});
