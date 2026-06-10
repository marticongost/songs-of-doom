import { Constant } from '../../../models/capabilities';
import { changeStats } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';

export default new Trait({
	title: {
		ca: 'Corpulència',
		es: 'Corpulencia',
		en: 'Brawn'
	},
	xpCost: 3,
	capabilities: [
		new Constant({
			id: 'passive',
			effects: [changeStats({ strength: 1 })]
		})
	]
});
