import { Constant } from '../../../models/capabilities';
import { changeStats } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';
import { flaw, innate, permanent } from '../../properties';

export default new Trait({
	title: { en: 'Clumsy', es: 'Torpe', ca: 'Maldestre' },
	xpCost: -3,
	properties: [flaw, innate, permanent],
	capabilities: [
		new Constant({
			effects: [changeStats({ agility: -1 })]
		})
	]
});
