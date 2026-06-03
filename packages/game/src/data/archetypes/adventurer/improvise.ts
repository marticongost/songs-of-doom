import { Action } from '../../../models/capabilities';
import { modifyCapabilityCost, modifyRoll } from '../../../models/effects';
import { triggerAction } from '../../../models/effects/triggeraction';
import { Skill } from '../../../models/entities/skill';
import { upgradable } from '../../../models/upgrades';

export default upgradable(Skill, 2, (variants) => ({
	title: {
		ca: 'Improvitzar',
		es: 'Improvisar',
		en: 'Improvise'
	},
	xpCost: variants.values(0, 1),
	capabilities: [
		new Action({
			effects: [
				triggerAction({
					modifiers: [modifyCapabilityCost({ any: 1 }), modifyRoll(-1)]
				})
			]
		})
	]
}));
