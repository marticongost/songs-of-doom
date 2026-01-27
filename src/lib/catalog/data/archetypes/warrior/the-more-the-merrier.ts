import { NearbyEnemiesCondition } from '$lib/catalog/models/conditions';
import { DrawFocusEffect } from '$lib/catalog/models/effects';
import { Opportunity } from '$lib/catalog/models/reaction';
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
				new NearbyEnemiesCondition({ minEnemies: 2, distance: 0 }).then(
					new DrawFocusEffect({ amount: 1 })
				)
			]
		})
	]
});
