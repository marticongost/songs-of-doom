import { Constant } from '../../../models/capabilities';
import { changeStats } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';

export default new Trait({
	title: { ca: 'Enginy', es: 'Ingenio', en: 'Cunning' },
	xpCost: 3,
	capabilities: [
		new Constant({
			effects: [changeStats({ intelligence: 1 })]
		})
	]
});
