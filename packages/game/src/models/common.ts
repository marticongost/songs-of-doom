import { Obligation, Opportunity } from './capabilities';
import { AttachEffect, replaceEncounter, TriggerAttackEffect } from './effects';
import { AddChargesEffect } from './effects/recharge';
import { copyAlreadyAttached, distance, eq } from './expressions';

export const fullyRechargeOnChapterStart = new Obligation({
	triggers: ['chapterStart'],
	effects: [new AddChargesEffect({ amount: 'max' })]
});

export const shootBeforeEngaged = new Opportunity({
	triggers: ['beforeEnemyEngagesWithSelf'],
	effects: [new TriggerAttackEffect({ card: { selection: 'this' } })]
});

export const attachOrReplaceWithNewEncounterWhenRevealed = new Obligation({
	triggers: ['revealed'],
	effects: [copyAlreadyAttached.then(replaceEncounter).orElse(new AttachEffect({}))]
});

export const sameLocation = eq(distance, 0);
