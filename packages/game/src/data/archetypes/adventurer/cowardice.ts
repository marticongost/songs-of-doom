import { Constant } from '../../../models/capabilities';
import { changeStats } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';
import { flaw, innate } from '../../properties';

export default new Trait({
	title: { en: 'Cowardice', es: 'Cobardía', ca: 'Covardia' },
	xpCost: -3,
	properties: [flaw, innate],
	capabilities: [
		new Constant({
			effects: [changeStats({ will: -1 })]
		})
	]
});
