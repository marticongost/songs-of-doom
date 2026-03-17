import { Constant } from '../../../models/capabilities';
import { changeStats } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';

export default new Trait({
	title: {
		ca: 'Atractiu',
		es: 'Atractivo',
		en: 'Good-looking'
	},
	xpCost: 4,
	capabilities: [
		new Constant({
			effects: [changeStats({ charisma: 1 })]
		})
	]
});
