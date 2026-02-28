import { Obligation, Opportunity } from './capabilities';
import { AttachEffect, replaceEncounter, TriggerAttackEffect } from './effects';
import { AddChargesEffect } from './effects/recharge';
import { copyAlreadyAttached } from './expressions';
import { Target } from './target';

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
	effects: [copyAlreadyAttached.then(replaceEncounter).orElse(new AttachEffect({}))]
});

export const currentLocation = new Target({ type: 'location', selection: 'closest' });
