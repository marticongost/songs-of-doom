import { Action, Constant } from '$lib/catalog/models/capabilities';
import { attachOrReplaceWithNewEncounterWhenRevealed } from '$lib/catalog/models/common';
import { ChangeStatsEffect, DiscardEffect } from '$lib/catalog/models/effects';
import { Encounter } from '$lib/catalog/models/encounter';

export default new Encounter({
	title: {
		ca: 'Fang i immundícia',
		es: 'Barro e inmundicia',
		en: 'Mud and Filth'
	},
	capabilities: [attachOrReplaceWithNewEncounterWhenRevealed],
	attachmentCapabilities: [
		new Constant({
			effects: [
				new ChangeStatsEffect({
					strength: -1
				})
			]
		}),
		new Action({
			cost: { strength: 1 },
			effects: [new DiscardEffect({})]
		})
	]
});
