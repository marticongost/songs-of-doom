import { NearbyEnemiesCondition } from '$lib/catalog/models/conditions';
import { DrawAptitudeEffect } from '$lib/catalog/models/effects';
import { ConditionalEffect } from '$lib/catalog/models/effects/conditional';
import { Reaction } from '$lib/catalog/models/reaction';
import { Trait } from '$lib/catalog/models/trait';

export default new Trait({
	title: {
		ca: 'Com més serem...',
		es: 'Cuantos más, mejor',
		en: 'The more the merrier'
	},
	capabilities: [
		new Reaction({
			triggers: ['chapterStart'],
			effects: [
				new ConditionalEffect({
					cases: [
						{
							condition: new NearbyEnemiesCondition({ minEnemies: 2, distance: 0 }),
							effects: [new DrawAptitudeEffect({ amount: 1 })]
						}
					]
				})
			]
		})
	]
});
