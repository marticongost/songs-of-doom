import { Constant } from '../../../models/capabilities';
import { changeStats } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';

export default new Trait({
	title: {
		ca: 'Fortalesa',
		es: 'Fortaleza',
		en: 'Resilience'
	},
	xpCost: 3,
	capabilities: [
		new Constant({
			effects: [changeStats({ health: 2 })]
		})
	]
});
