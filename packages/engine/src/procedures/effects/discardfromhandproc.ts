import type { DiscardFromHandEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { CardId, PlayerId } from '../../state/identifiers';
import type { EffectProcedureState } from '../core/triggereffect';

export interface DiscardFromHandEffectState extends EffectProcedureState<DiscardFromHandEffect> {
	/** The resolved player IDs affected by the effect. */
	playerIds?: PlayerId[];

	/** The current player being processed in the for-each loop. */
	playerId?: PlayerId;

	/** The cards selected for discarding from the current player's hand. */
	selectedCardIds?: CardId[];
}

const { define, resolveTargetList, forEach, mutateGameState } =
	instructions<DiscardFromHandEffectState>();

export const discardFromHandEffectProc = define({
	id: ProcedureId.DiscardFromHandEffect,
	steps: {
		resolvePlayers: resolveTargetList(
			({ effect }) => effect.players ?? 'active-player',
			'playerIds'
		),
		processPlayers: forEach({
			name: 'playerId',
			items: (state) => state.playerIds!,
			steps: {
				chooseCards: resolveTargetList(({ effect }) => effect.cards, 'selectedCardIds'),
				discardCards: mutateGameState((state, game) => {
					for (const cardId of state.selectedCardIds!) {
						const card = game.requireCard(cardId);
						card.moveToTopOfDiscardPile(game);
					}
				})
			}
		})
	}
});
