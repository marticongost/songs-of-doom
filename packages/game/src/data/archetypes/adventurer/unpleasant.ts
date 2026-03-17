import { Constant } from '../../../models/capabilities';
import { changeStats } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';
import { flaw, innate } from '../../properties';

export default new Trait({
	title: { en: 'Unpleasant', es: 'Desagradable', ca: 'Desagradable' },
	xpCost: -3,
	properties: [flaw, innate],
	capabilities: [
		new Constant({
			effects: [changeStats({ charisma: -1 })]
		})
	]
});
