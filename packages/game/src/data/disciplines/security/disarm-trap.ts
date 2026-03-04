import { Constant } from '../../../models/capabilities';
import { TalentEffect } from '../../../models/effects/talenteffect';
import { Trait } from '../../../models/trait';
import { disarmTrap } from '../../talents';

export default new Trait({
	title: { ca: 'Desactivar trampes', es: 'Desactivar trampas', en: 'Disarm traps' },
	xpCost: 2,
	capabilities: [
		new Constant({
			effects: [new TalentEffect({ talent: disarmTrap })]
		})
	]
});
