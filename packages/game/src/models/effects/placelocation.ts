import { Effect } from './effect';

/** The physical position of the location in the game map. */
export type MapCoordinates = { x: number; y: number };

/** Direction for a map connection between two locations. */
export type MapConnectionDirection = 'toTargetOnly' | 'toOriginOnly' | 'bidirectional';

/**
 * A connection between two locations on the map.
 *
 * When given as a plain string, it's equivalent to `{ target: <string>, direction: "bidirectional" }`.
 */
export type MapConnection = string | { target: string; direction?: MapConnectionDirection };

/**
 * Normalises a {@link MapConnection} to its object form.
 */
export function normaliseMapConnection(connection: MapConnection): {
	target: string;
	direction: MapConnectionDirection;
} {
	if (typeof connection === 'string') {
		return { target: connection, direction: 'bidirectional' };
	}
	return { target: connection.target, direction: connection.direction ?? 'bidirectional' };
}

/** Props for configuring a PlaceLocationEffect. */
export interface PlaceLocationEffectProps {
	/** The catalog ID of the location card to place. */
	id: string;

	/** The coordinates where the location should be placed on the map. */
	coordinates: MapCoordinates;

	/** Connections to other locations on the map. */
	connections: ReadonlyArray<MapConnection>;
}

/**
 * An effect that places a location card onto the game map at the given
 * coordinates, establishing its connections to other locations.
 */
export class PlaceLocationEffect extends Effect {
	/** The catalog ID of the location card to place. */
	readonly id: string;

	/** The coordinates where the location should be placed on the map. */
	readonly coordinates: MapCoordinates;

	/** Connections to other locations on the map. */
	readonly connections: ReadonlyArray<MapConnection>;

	constructor({ id, coordinates, connections }: PlaceLocationEffectProps) {
		super();
		this.id = id;
		this.coordinates = coordinates;
		this.connections = connections;
	}
}

/** Creates a place location effect. */
export const placeLocation = (props: PlaceLocationEffectProps): PlaceLocationEffect =>
	new PlaceLocationEffect(props);
