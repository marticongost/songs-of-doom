import { Obligation } from '../../../models/capabilities';
import { addCharges, modifyCapabilityCost, removeCharges } from '../../../models/effects';
import { Trait } from '../../../models/entities/trait';
import { charges, reactivePlayerIsSubject } from '../../../models/expressions';
import { flaw, permanent } from '../../properties';

export default new Trait({
	title: { ca: 'Vell', es: 'Viejo', en: 'Old' },
	xpCost: -2,
	properties: [flaw, permanent],
	capabilities: [
		new Obligation({
			triggers: [{ event: 'movement', condition: reactivePlayerIsSubject }],
			effects: [modifyCapabilityCost({ cost: { any: charges } }), addCharges(1)]
		}),
		new Obligation({
			triggers: ['chapterStart'],
			effects: [removeCharges({})]
		})
	]
});
