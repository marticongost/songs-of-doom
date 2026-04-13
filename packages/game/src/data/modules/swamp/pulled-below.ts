import { Action, Obligation } from '../../../models/capabilities';
import {
	attach,
	discard,
	replaceEncounter,
	sanityLoss,
	test,
	wound
} from '../../../models/effects';
import { addCharges } from '../../../models/effects/recharge';
import { Encounter } from '../../../models/entities/encounter';
import {
	charges,
	copyAlreadyAttached,
	minus,
	plus,
	reactiveCardIsSubject
} from '../../../models/expressions';
import { agility, strength } from '../../../models/stats';

export default new Encounter({
	title: {
		ca: 'Arrossegat endins',
		es: 'Arrastrado adentro',
		en: 'Pulled below'
	},
	capabilities: [
		new Obligation({
			triggers: [{ event: 'encounterRevealed', condition: reactiveCardIsSubject }],
			effects: [
				copyAlreadyAttached.then(replaceEncounter()).orElse(
					test({
						expression: minus(agility, 1),
						results: {
							failed: [wound(1), sanityLoss(1), attach({})]
						}
					})
				)
			]
		})
	],
	attachmentCapabilities: [
		new Action({
			prioritary: true,
			cost: { strength: 1 },
			effects: [
				test({
					expression: plus(minus(strength, 1), charges),
					results: { 0: [addCharges(1)], '1+': [discard()] }
				})
			]
		})
	]
});
