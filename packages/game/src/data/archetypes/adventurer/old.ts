import { Obligation } from '../../../models/capabilities';
import { addCharges, modifyCapabilityCost, removeCharges } from '../../../models/effects';
import { charges } from '../../../models/expressions';
import { Trait } from '../../../models/entities/trait';
import { flaw, permanent } from '../../properties';

export default new Trait({
	title: { ca: 'Vell', es: 'Viejo', en: 'Old' },
	xpCost: -2,
	properties: [flaw, permanent],
	capabilities: [
		new Obligation({
			triggers: ['moving'],
			effects: [modifyCapabilityCost({ cost: { any: charges } }), addCharges(1)]
		}),
		new Obligation({
			triggers: ['chapterStart'],
			effects: [removeCharges({})]
		})
	]
});
