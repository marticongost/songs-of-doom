import { Constant } from '../../../models/capabilities';
import { changeStats } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';

export default new Trait({
	title: {
		ca: 'Saviesa',
		es: 'Sabiduría',
		en: 'Wisdom'
	},
	xpCost: 4,
	capabilities: [
		new Constant({
			effects: [changeStats({ intelligence: 1 })]
		})
	]
});
