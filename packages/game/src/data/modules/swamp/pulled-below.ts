import { Action, Obligation } from '../../../models/capabilities';
import {
	AttachEffect,
	discard,
	replaceEncounter,
	SanityLossEffect,
	TestEffect,
	WoundEffect
} from '../../../models/effects';
import { AddChargesEffect } from '../../../models/effects/recharge';
import { Encounter } from '../../../models/entities/encounter';
import { charges, copyAlreadyAttached, minus, plus } from '../../../models/expressions';
import { agility, strength } from '../../../models/stats';

export default new Encounter({
	title: {
		ca: 'Arrossegat endins',
		es: 'Arrastrado adentro',
		en: 'Pulled below'
	},
	capabilities: [
		new Obligation({
			triggers: ['revealed'],
			effects: [
				copyAlreadyAttached.then(replaceEncounter).orElse(
					new TestEffect({
						expression: minus(agility, 1),
						results: {
							failed: [
								new WoundEffect({ damage: 1 }),
								new SanityLossEffect({ amount: 1 }),
								new AttachEffect({})
							]
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
				new TestEffect({
					expression: plus(minus(strength, 1), charges),
					results: { 0: [new AddChargesEffect({ amount: 1 })], '1+': [discard] }
				})
			]
		})
	]
});
