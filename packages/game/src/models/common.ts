import { Obligation, Opportunity } from './capabilities';
import { attach, addCharges, replaceEncounter, triggerAttack } from './effects';
import { copyAlreadyAttached, distance, eq } from './expressions';

export const fullyRechargeOnChapterStart = new Obligation({
	triggers: ['chapterStart'],
	effects: [addCharges('max')]
});

export const shootBeforeEngaged = new Opportunity({
	triggers: ['beforeEnemyEngagesWithSelf'],
	effects: [triggerAttack({ card: { selection: 'this' } })]
});

export const attachOrReplaceWithNewEncounterWhenRevealed = new Obligation({
	triggers: ['revealed'],
	effects: [copyAlreadyAttached.then(replaceEncounter()).orElse(attach())]
});

export const sameLocation = eq(distance, 0);
