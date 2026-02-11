import { Action, Constant } from '$lib/catalog/models/capabilities';
import { attachOrReplaceWithNewEncounterWhenRevealed } from '$lib/catalog/models/common';
import { ChangeStatsEffect, discard } from '$lib/catalog/models/effects';
import { Encounter } from '$lib/catalog/models/encounter';

export default new Encounter({
	title: {
		ca: 'Mosques',
		es: 'Moscas',
		en: 'Flies'
	},
	capabilities: [attachOrReplaceWithNewEncounterWhenRevealed],
	attachmentCapabilities: [
		new Constant({
			effects: [
				new ChangeStatsEffect({
					strength: -1,
					agility: -1
				})
			]
		}),
		new Action({
			cost: { agility: 1 },
			effects: [discard]
		})
	]
});
