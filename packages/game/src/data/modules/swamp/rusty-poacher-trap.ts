import { Action, Constant, Obligation } from '../../../models/capabilities';
import {
	attach,
	conferProperties,
	discard,
	replaceEncounter,
	test,
	wound
} from '../../../models/effects';
import { Encounter } from '../../../models/entities/encounter';
import {
	copyAlreadyAttached,
	reactiveCardIsSubject,
	talentProficiency
} from '../../../models/expressions';
import { immobilized, piercing } from '../../properties';
import { disarmTrap } from '../../talents';

export default new Encounter({
	title: { ca: 'Trampa rovellada', es: 'Trampa oxidada', en: 'Rusty poacher trap' },
	capabilities: [
		new Obligation({
			triggers: [{ event: 'encounterRevealed', condition: reactiveCardIsSubject }],
			effects: [
				copyAlreadyAttached.then(replaceEncounter()).orElse(
					test({
						expression: talentProficiency(disarmTrap),
						results: {
							failed: [wound({ damage: 3, properties: [piercing.with({ value: 2 })] }), attach({})]
						}
					})
				)
			]
		})
	],
	attachmentCapabilities: [
		new Constant({ effects: [conferProperties([immobilized])] }),
		new Action({ cost: { strength: 2 }, effects: [discard()] })
	]
});
