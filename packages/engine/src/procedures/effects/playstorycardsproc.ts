import type { PlayStoryCardsEffect, Story } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import { ReadonlyCardState } from '../../state/cardstate';
import type { StoryId } from '../../state/identifiers';
import type { EffectProcedureState } from '../core/triggereffect';

export interface PlayStoryCardsEffectState extends EffectProcedureState<PlayStoryCardsEffect> {
	/** The current story card being played. Set by the forEach loop iteration. */
	currentCard?: Story;
}

const { define, forEach, mutateGameState, emitEvent } = instructions<PlayStoryCardsEffectState>();

export const playStoryCardsEffectProc = define({
	id: ProcedureId.PlayStoryCardsEffect,
	steps: {
		forEachStoryCard: forEach({
			name: 'currentCard',
			items: (state) => state.effect.cards,
			steps: {
				attach: mutateGameState((state, game) => {
					if (!game.scenario) {
						throw new Error('No scenario in game state');
					}
					game.scenario.addAttachment(
						game,
						new ReadonlyCardState({
							id: ('sto-' + state.currentCard!.id) as StoryId,
							card: state.currentCard!
						}).mutable()
					);
				}),
				emit: emitEvent({
					eventType: 'storyPlayed',
					eventContext: (state) => ({ subjectId: ('sto-' + state.currentCard!.id) as StoryId })
				})
			}
		})
	}
});
