import { shuffle } from '@songsofdoom/common';
import { events } from '@songsofdoom/game';
import { instructions } from '../../../core/instructions';
import { type ProcedureState, ProcedureId } from '../../../core/procedure';
import type { CardId } from '../../../state/identifiers';
import type { ReadonlyPlayerState } from '../../../state/playerstate';
import { emitEvent } from '../../core/emitevent';

export type EncounterPhaseStepId = 'everyPlayer';

export interface EncounterPhaseState extends ProcedureState {
	player?: ReadonlyPlayerState;
	/** Set during the `deal` step so `reveal` can reference the card. */
	encounterCardId?: CardId;
}

const { define, forEach, call } = instructions<EncounterPhaseState>();

/**
 * C5 — Encounter phase.
 * Each non-defeated player is dealt one encounter card, which is placed in their
 * staging area, and an `encounterRevealed` event is emitted.
 */
export const encounterPhase = define({
	id: ProcedureId.EncounterPhase,
	steps: {
		everyPlayer: forEach({
			name: 'player',
			items: (state) => state.game.players,
			where: (_state, player) => !player!.defeated,
			steps: {
				deal(state: EncounterPhaseState) {
					let encounterCardId: CardId | undefined;
					const mutatedGame = state.game.mutate((game) => {
						// Reshuffle discard pile into deck if the deck is empty
						if (game.encounterDeck.length === 0) {
							game.encounterDeck = [...game.encounterDiscardPile];
							shuffle(game.encounterDeck);
							game.encounterDiscardPile = [];
							for (const card of game.encounterDeck) {
								card.container = { type: 'encounter-deck' };
							}
						}

						const encounterCard = game.encounterDeck.shift();
						if (encounterCard) {
							const mutablePlayer = game.requirePlayer(state.player!.id);
							encounterCard.container = { type: 'player', playerId: state.player!.id };
							mutablePlayer.stage.push(encounterCard);
							encounterCardId = encounterCard.id;
						}
					});
					return { ...state, game: mutatedGame, encounterCardId };
				},
				reveal: call(emitEvent, (state) => ({
					eventType: events.encounterRevealed.type,
					eventContext: {
						subjectId: state.encounterCardId,
						targetId: state.player!.id
					}
				}))
			}
		})
	}
});
