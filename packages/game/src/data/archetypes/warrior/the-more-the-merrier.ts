import { Opportunity } from '../../../models/capabilities';
import { drawFocus } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';
import { count, distance, eq, gte } from '../../../models/expressions';

export default new Trait({
	title: {
		ca: 'Com més serem...',
		es: 'Cuantos más, mejor',
		en: 'The more the merrier'
	},
	xpCost: 2,
	capabilities: [
		new Opportunity({
			id: 'activate',
			triggers: ['chapterStart'],
			effects: [gte(count({ type: 'enemy', condition: eq(distance, 0) }), 2).then(drawFocus(1))]
		})
	]
});
