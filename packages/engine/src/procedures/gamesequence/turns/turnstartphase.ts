import { isAlly, isCreature } from '@songsofdoom/game';
import { instructions } from '../../../core/instructions';
import { type ProcedureState, ProcedureId } from '../../../core/procedure';

export interface TurnStartPhaseState extends ProcedureState {}

const { define, mutateGameState, emitEvent } = instructions<TurnStartPhaseState>();

export const turnStartPhase = define({
	id: ProcedureId.TurnStartPhase,
	steps: {
		init: mutateGameState((state, game) => {
			game.turn++;
			for (const player of game.players) {
				player.activated = false;
			}
			for (const card of game.cards()) {
				if (isAlly(card.card) || isCreature(card.card)) {
					card.activated = false;
				}
			}
		}),
		emitTurnStartEvent: emitEvent({ eventType: 'turnStart' })
	}
});
