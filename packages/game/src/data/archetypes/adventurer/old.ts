import { Obligation } from '../../../models/capabilities';
import {
	AddChargesEffect,
	ModifyCapabilityCostEffect,
	RemoveChargesEffect
} from '../../../models/effects';
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
			effects: [
				new ModifyCapabilityCostEffect({ cost: { any: charges } }),
				new AddChargesEffect({ amount: 1 })
			]
		}),
		new Obligation({
			triggers: ['chapterStart'],
			effects: [new RemoveChargesEffect({})]
		})
	]
});
