import { Obligation } from '../../../models/capabilities';
import { attachOrReplaceWithNewEncounterWhenRevealed } from '../../../models/common';
import { discard, ModifyCapabilityCostEffect } from '../../../models/effects';
import { Encounter } from '../../../models/encounter';

export default new Encounter({
	title: {
		ca: 'Fang i immundícia',
		es: 'Barro e inmundicia',
		en: 'Mud and Filth'
	},
	capabilities: [attachOrReplaceWithNewEncounterWhenRevealed],
	attachmentCapabilities: [
		new Obligation({
			triggers: ['moving'],
			effects: [new ModifyCapabilityCostEffect({ cost: { strength: 2 } }), discard]
		})
	]
});
