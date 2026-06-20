import type { ReadonlyCounter } from '@songsofdoom/common';
import { type FocusToken, drawFocus } from '@songsofdoom/game';
import { FocusesField } from '../../../core/input';
import { instructions } from '../../../core/instructions';
import { type ProcedureState } from '../../../core/procedure';
import { ProcedureId } from '../../../core/procedureid';
import type { ReadonlyPlayerState } from '../../../state/playerstate';

export type FocusPhaseStepId = 'everyPlayer';

export interface FocusPhaseState extends ProcedureState {
	focusTokensToKeep?: ReadonlyCounter<FocusToken>;
	player?: ReadonlyPlayerState;
}

const { define, forEach, dispatch, input, mutateGameState, triggerEffect } =
	instructions<FocusPhaseState>();

export const focusPhase = define({
	id: ProcedureId.FocusPhase,
	steps: {
		everyPlayer: forEach({
			name: 'player',
			items: (state) => state.game.players,
			where: (_state, player) => !player.defeated,
			boundContext: (_state, player) => ({ subjectId: player.id }),
			steps: {
				askWhichFocusTokensToKeep: dispatch((state) => {
					const { player, game } = state;
					const hand = player!.focusesHand;
					const concentration = game.getConcentration(player!.id);
					if (hand.totalCount() <= concentration) {
						return () => ({ ...state, step: 'drawNewTokens' });
					}
					return input({
						fields: () => {
							return [
								new FocusesField({
									name: 'selection',
									focuses: hand,
									maxTotalTokens: concentration,
									required: true
								})
							];
						}
					});
				}),
				discardExcessiveTokens: mutateGameState(({ player, focusTokensToKeep }, game) => {
					const mutablePlayer = game.requirePlayer(player!.id);
					for (const [token, currentCount] of player!.focusesHand.entries()) {
						const keep = focusTokensToKeep!.get(token);
						const discard = currentCount - keep;
						if (discard > 0) {
							mutablePlayer.focusesHand.remove(token, discard);
							mutablePlayer.focusesDiscardPile.add(token, discard);
						}
					}
				}),
				drawNewTokens: triggerEffect({ effect: drawFocus(5) })
			}
		})
	}
});
