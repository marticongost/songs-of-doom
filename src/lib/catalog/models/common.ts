import { Obligation, Opportunity } from './capabilities';
import { AttachEffect, ReplaceEncounterEffect, TriggerAttackEffect } from './effects';
import { AddChargesEffect } from './effects/recharge';
import { copyAlreadyAttached } from './expressions';

export const fullyRechargeOnChapterStart = new Obligation({
	triggers: ['chapterStart'],
	effects: [new AddChargesEffect({ amount: 'max' })]
});

export const shootBeforeEngaged = new Opportunity({
	triggers: ['beforeEnemyEngagesWithSelf'],
	effects: [
		new TriggerAttackEffect({
			card: 'this'
		})
	]
});

export const attachOrReplaceWithNewEncounterWhenRevealed = new Obligation({
	triggers: ['revealed'],
	effects: [copyAlreadyAttached.then(new ReplaceEncounterEffect()).orElse(new AttachEffect({}))]
});
