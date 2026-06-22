import {
	entities,
	type MapConnectionDirection,
	normaliseMapConnection,
	type PlaceLocationEffect
} from '@songsofdoom/game';
import { instructions } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { LocationId } from '../../state/identifiers';
import { MutableLocationState } from '../../state/locationstate';
import type { EffectProcedureState } from '../core/triggereffect';

export interface PlaceLocationEffectState extends EffectProcedureState<PlaceLocationEffect> {
	/** The runtime ID of the newly placed location. */
	locationId: LocationId;
}

const { define, emitEvent } = instructions<PlaceLocationEffectState>();

export const placeLocationEffectProc = define({
	id: ProcedureId.PlaceLocationEffect,
	steps: {
		placeLocation(state) {
			const entity = entities.require(state.effect.id);

			if (entity.type.id !== 'location') {
				throw new Error(`Entity "${state.effect.id}" is not a location (type: ${entity.type.id})`);
			}

			let locationId: LocationId;

			const mutatedGame = state.game.mutate((game) => {
				const locationState = game.createCardState(entity) as MutableLocationState;
				locationState.coordinates = { ...state.effect.coordinates };
				game.locations.push(locationState);
				locationId = locationState.id;

				for (const connection of state.effect.connections) {
					const { target, direction } = normaliseMapConnection(connection);

					const targetLocation = game.locations.find((loc) => loc.card.id === target);
					if (!targetLocation) {
						throw new Error(
							`Cannot connect location "${state.effect.id}" to "${target}": ` +
								`no location with card ID "${target}" is on the map`
						);
					}

					establishConnection(locationState, targetLocation, direction);
				}
			});

			return { ...state, game: mutatedGame, locationId: locationId! };
		},
		emitEvent: emitEvent({
			eventType: 'locationPlayed',
			eventContext: (state) => ({ subjectId: state.locationId })
		})
	}
});

/**
 * Establishes a directed or bidirectional connection between two locations,
 * avoiding duplicates.
 */
function establishConnection(
	origin: MutableLocationState,
	target: MutableLocationState,
	direction: MapConnectionDirection
): void {
	const addConnection = (from: MutableLocationState, to: MutableLocationState) => {
		if (!from.connections.includes(to.id)) {
			from.connections.push(to.id);
		}
	};

	if (direction === 'bidirectional' || direction === 'toTargetOnly') {
		addConnection(origin, target);
	}
	if (direction === 'bidirectional' || direction === 'toOriginOnly') {
		addConnection(target, origin);
	}
}
