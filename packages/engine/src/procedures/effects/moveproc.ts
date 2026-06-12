import { propertyData, type MoveEffect } from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import { isPlayerId, type LocationId } from '../../state/identifiers';
import type { EffectProcedureState } from '../core/triggereffect';

export interface MoveEffectState extends EffectProcedureState<MoveEffect> {
	/** The destination location selected by the player. */
	destinationId?: LocationId;
}

const { define, requireSingleTarget, emitEvent, mutateGameState } = instructions<MoveEffectState>();

export const moveEffectProc = define({
	id: ProcedureId.MoveEffect,
	steps: {
		validate(state) {
			const subject = state.game.requireSubject();
			if (!isPlayerId(subject.id)) {
				return { ...state, status: 'cancelled' };
			}

			const player = state.game.requirePlayer(subject.id);
			if (player.hasProperty(propertyData.immobilized)) {
				return { ...state, status: 'cancelled' };
			}

			const currentLocation = state.game.getEntityLocation(subject.id);
			if (!currentLocation || currentLocation.connections.length === 0) {
				return { ...state, status: 'cancelled' };
			}

			return state;
		},
		resolveDestination: requireSingleTarget({ type: 'location', cardinality: 1 }, 'destinationId'),
		emitLeavingLocation: emitEvent({
			eventType: 'leavingLocation',
			eventContext: (state) => {
				const subject = state.game.requireSubject();
				const currentLocation = state.game.getEntityLocation(subject.id);
				return { targetId: currentLocation?.id };
			}
		}),
		emitMovement: emitEvent({
			eventType: 'movement',
			eventContext: (state) => ({ targetId: state.destinationId })
		}),
		applyMove: mutateGameState((state, game) => {
			const subject = game.requireSubject();
			if (state.destinationId) {
				game.setActorLocation(subject.id, state.destinationId);
			}
		}),
		emitLocationEntered: emitEvent({
			eventType: 'locationEntered',
			eventContext: (state) => ({ targetId: state.destinationId })
		})
	}
});
