import { Action, Constant, Obligation } from '../../../models/capabilities';
import {
	AttachEffect,
	discard,
	replaceEncounter,
	TestEffect,
	WoundEffect
} from '../../../models/effects';
import { immobilize } from '../../../models/effects/immobilize';
import { Encounter } from '../../../models/encounter';
import { copyAlreadyAttached, talentProficiency } from '../../../models/expressions';
import { piercing } from '../../properties';
import { disarmTrap } from '../../talents';

export default new Encounter({
	title: { ca: 'Trampa rovellada', es: 'Trampa oxidada', en: 'Rusty poacher trap' },
	capabilities: [
		new Obligation({
			triggers: ['revealed'],
			effects: [
				copyAlreadyAttached.then(replaceEncounter).orElse(
					new TestEffect({
						expression: talentProficiency(disarmTrap),
						results: {
							failed: [
								new WoundEffect({ damage: 3, properties: [piercing.with({ value: 2 })] }),
								new AttachEffect({})
							]
						}
					})
				)
			]
		})
	],
	attachmentCapabilities: [
		new Constant({ effects: [immobilize] }),
		new Action({ cost: { strength: 2 }, effects: [discard] })
	]
});
