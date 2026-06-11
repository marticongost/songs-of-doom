import { Obligation, Opportunity } from './capabilities';
import { attach } from './effects/attach';
import { addCharges } from './effects/recharge';
import { replaceEncounter } from './effects/replaceencounter';
import { triggerAttack } from './effects/triggeraction';
import {
	copyAlreadyAttached,
	distance,
	eq,
	reactiveCardIsSubject,
	reactivePlayerIsTarget
} from './expressions';

export const fullyRechargeOnChapterStart = new Obligation({
	id: 'fullyRechargeOnChapterStart',
	triggers: ['chapterStart'],
	effects: [addCharges('max')]
});

export const shootBeforeEngaged = new Opportunity({
	id: 'shootBeforeEngaged',
	triggers: [{ event: 'engage', condition: reactivePlayerIsTarget }],
	effects: [triggerAttack({ card: 'current-card' })]
});

export const attachOrReplaceWithNewEncounterWhenRevealed = new Obligation({
	id: 'attachOrReplaceWithNewEncounterWhenRevealed',
	triggers: [{ event: 'encounterRevealed', condition: reactiveCardIsSubject }],
	effects: [copyAlreadyAttached.then(replaceEncounter()).orElse(attach())]
});

export const sameLocation = eq(distance, 0);
