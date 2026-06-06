import { Action, Constant } from '../../../models/capabilities';
import { attachOrReplaceWithNewEncounterWhenRevealed } from '../../../models/common';
import { changeStats, discard } from '../../../models/effects';
import { Encounter } from '../../../models/entities/encounter';

export default new Encounter({
	title: {
		ca: 'Mosques',
		es: 'Moscas',
		en: 'Flies'
	},
	capabilities: [attachOrReplaceWithNewEncounterWhenRevealed],
	attachmentCapabilities: [
		new Constant({
			id: 'penalty',
			effects: [
				changeStats({
					strength: -1,
					agility: -1
				})
			]
		}),
		new Action({
			id: 'discard',
			cost: { agility: 1 },
			effects: [discard()]
		})
	]
});
