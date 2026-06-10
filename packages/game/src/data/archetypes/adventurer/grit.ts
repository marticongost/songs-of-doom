import { Constant } from '../../../models/capabilities';
import { changeStats } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';

export default new Trait({
	title: {
		ca: 'Coratge',
		es: 'Coraje',
		en: 'Grit'
	},
	xpCost: 4,
	capabilities: [
		new Constant({
			id: 'passive',
			effects: [changeStats({ will: 1 })]
		})
	]
});
