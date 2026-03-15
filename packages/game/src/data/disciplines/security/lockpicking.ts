import { Constant } from '../../../models/capabilities';
import { TalentEffect } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';
import disarmTrap from './disarm-trap';

export default new Trait({
	title: { ca: 'Forçar panys', es: 'Forzar cerraduras', en: 'Lockpicking' },
	xpCost: 2,
	capabilities: [
		new Constant({
			effects: [new TalentEffect({ talents: [disarmTrap] })]
		})
	]
});
