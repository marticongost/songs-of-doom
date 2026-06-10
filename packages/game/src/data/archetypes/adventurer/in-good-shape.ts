import { Constant } from '../../../models/capabilities';
import { changeStats } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';

export default new Trait({
	title: {
		ca: 'Forma física',
		es: 'Forma física',
		en: 'In good shape'
	},
	xpCost: 4,
	capabilities: [
		new Constant({
			id: 'passive',
			effects: [changeStats({ strength: 1 })]
		})
	]
});
