import { Effect } from './effect';

/**
 * An effect that allows a character to execute a move action, changing their
 * location to an adjacent, accessible location.
 */
export class MoveEffect extends Effect {
	/*
	override async apply(gameGraph: GameGraph) {
		const subjectId = gameGraph.current.state.requireSubject().id;
		if (!isPlayerId(subjectId)) return;

		const state = gameGraph.current.state;
		const player = state.requirePlayer(subjectId);
		if (player.hasProperty(immobilized)) return;

		const currentLocation = state.getEntityLocation(subjectId);
		if (!currentLocation || currentLocation.connections.length === 0) return;

		const destinationId = (await gameGraph.requestSingleTarget(
			new Target<LocationTargetType>({ type: 'location', cardinality: 1 }),
			{ playerId: subjectId }
		)) as LocationId | undefined;
		if (!destinationId) return;

		await gameGraph.triggerEvent('leavingLocation', { targetId: currentLocation.id });
		await gameGraph.triggerEvent('movement', { targetId: destinationId });
		gameGraph.mutate((state) => {
			state.setActorLocation(subjectId, destinationId);
			return { playerId: subjectId, locationId: destinationId } as MoveOutcome;
		});
		await gameGraph.triggerEvent('locationEntered', { targetId: destinationId });
	}
	*/
}

/**
 * Creates an effect that moves to an adjacent, accessible location.
 */
export const move = (): MoveEffect => new MoveEffect();
