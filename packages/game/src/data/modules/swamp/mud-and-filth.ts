import { Obligation } from '../../../models/capabilities';
import { attachOrReplaceWithNewEncounterWhenRevealed } from '../../../models/common';
import { discard, modifyCapabilityCost } from '../../../models/effects';
import { Encounter } from '../../../models/entities/encounter';

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
			effects: [modifyCapabilityCost({ cost: { strength: 2 } }), discard()]
		})
	]
});
