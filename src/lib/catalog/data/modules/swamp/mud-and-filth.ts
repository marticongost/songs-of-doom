import { Obligation } from '$lib/catalog/models/capabilities';
import { attachOrReplaceWithNewEncounterWhenRevealed } from '$lib/catalog/models/common';
import { discard, ModifyCapabilityCostEffect } from '$lib/catalog/models/effects';
import { Encounter } from '$lib/catalog/models/encounter';

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
