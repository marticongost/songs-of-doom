import { Constant } from '../../../models/capabilities';
import { talent } from '../../../models/effects/talenteffect';
import { Trait } from '../../../models/entities/trait';
import { disarmTrap } from '../../talents';

export default new Trait({
	title: { ca: 'Desactivar trampes', es: 'Desactivar trampas', en: 'Disarm traps' },
	xpCost: 2,
	capabilities: [
		new Constant({
			id: 'passive',
			effects: [talent([disarmTrap])]
		})
	]
});
