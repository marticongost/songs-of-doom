import type { PlayStoryCardsEffect, Story } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import { type MutableCardState } from '../../state/cardstate';
import type { CardId, StoryId } from '../../state/identifiers';
import type { EffectProcedureState } from '../core/triggereffect';

export interface PlayStoryCardsEffectState extends EffectProcedureState<PlayStoryCardsEffect> {
	/** The current story card being played. Set by the forEach loop iteration. */
	currentCard?: Story;

	/**
	 * The ID of the current story card being played. Set by the attach step of the forEach loop.
	 */
	currentCardId?: StoryId;
}

const { define, forEach, emitEvent } = instructions<PlayStoryCardsEffectState>();

export const playStoryCardsEffectProc = define({
	id: ProcedureId.PlayStoryCardsEffect,
	steps: {
		forEachStoryCard: forEach({
			name: 'currentCard',
			items: (state) => state.effect.cards,
			steps: {
				attach: (state: PlayStoryCardsEffectState) => {
					const { game } = state;
					if (!game.scenario) {
						throw new Error('No scenario in game state');
					}
					let storyStateId: StoryId;
					const modifiedGame = game.mutate((mutableGame) => {
						const attachmentState = mutableGame.createCardState(
							state.currentCard!
						) as MutableCardState;
						mutableGame.scenario!.addAttachment(mutableGame, attachmentState);
						storyStateId = attachmentState.id as StoryId;
					});
					return {
						...state,
						game: modifiedGame,
						currentCardId: storyStateId!
					};
				},
				emit: emitEvent({
					eventType: 'storyPlayed',
					eventContext: (state) => ({ subjectId: state.currentCardId! as CardId })
				})
			}
		})
	}
});
