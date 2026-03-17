import { Constant } from '../../../models/capabilities';
import { changeStats } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';
import { flaw, permanent } from '../../properties';

export default new Trait({
	title: { en: 'Veteran', es: 'Veterano', ca: 'Veterà' },
	xpCost: -2,
	properties: [flaw, permanent],
	capabilities: [
		new Constant({
			effects: [changeStats({ health: -1, sanity: -1 })]
		})
	]
});
