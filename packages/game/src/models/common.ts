import { Obligation, Opportunity } from './capabilities';
import { addCharges, attach, replaceEncounter, triggerAttack } from './effects';
import {
	copyAlreadyAttached,
	distance,
	eq,
	reactiveCardIsSubject,
	reactivePlayerIsTarget
} from './expressions';

export const fullyRechargeOnChapterStart = new Obligation({
	triggers: ['chapterStart'],
	effects: [addCharges('max')]
});

export const shootBeforeEngaged = new Opportunity({
	triggers: [{ event: 'engage', condition: reactivePlayerIsTarget }],
	effects: [triggerAttack({ card: { selection: 'this' } })]
});

export const attachOrReplaceWithNewEncounterWhenRevealed = new Obligation({
	triggers: [{ event: 'encounterRevealed', condition: reactiveCardIsSubject }],
	effects: [copyAlreadyAttached.then(replaceEncounter()).orElse(attach())]
});

export const sameLocation = eq(distance, 0);
