import type { Property } from '@songsofdoom/game';
import {
	CardState,
	type CardStateProps,
	type MutableCardState,
	type ReadonlyCardState
} from './cardstate';
import {
	addAttachmentToCard,
	addPropertyToEntity,
	banishCard,
	moveCardToBottomOfDeck,
	moveCardToBottomOfDiscardPile,
	moveCardToHand,
	moveCardToLocation,
	moveCardToPlayer,
	moveCardToStage,
	moveCardToTopOfDeck,
	moveCardToTopOfDiscardPile,
	mutate
} from './entitystatemutation';
import type { MutableGameState } from './gamestate';
import type { CardId, EntityId, LocationId, PlayerId } from './identifiers';

export interface LocationStateProps extends Omit<CardStateProps, 'id'> {
	id: LocationId;

	/** The ids of the players currently at this location. */
	players?: ReadonlyArray<EntityId>;

	/** The ids of locations connected to this location. */
	connections?: ReadonlyArray<LocationId>;
}

export type Path = Array<LocationId>;
export type PathScorer = (path: Path) => number;

/**
 * Minimal interface required for pathfinding. Satisfied structurally by GameState, avoiding a
 * circular import.
 */
export interface LocationGraph {
	getCard(id: LocationId): LocationState | undefined;
}

export interface PathfindingOptions {
	/** Used to break ties in case of multiple paths of the same length. Paths with a higher score will be preferred. If no scorer is provided, ties will be broken arbitrarily. */
	scorer?: PathScorer;

	/**
	 * Whether a connection between two locations is allowed for the purposes of
	 * pathfinding.
	 *
	 * If no function is provided, all connections will be allowed. This can be used to
	 * implement game mechanics that prevent certain connections from being used, such as
	 * a locked door or other transient impediments.
	 *
	 * @param origin The location the connection starts from.
	 * @param destination The location the connection goes to.
	 * @returns Whether the connection is allowed to be used for pathfinding.
	 */
	allowedConnections?: (origin: LocationId, destination: LocationId) => boolean;
}

export class LocationState extends CardState {
	declare readonly id: LocationId;

	/** The ids of the players currently at this location. */
	readonly players: ReadonlyArray<EntityId>;

	/** The ids of locations connected to this location. */
	readonly connections: ReadonlyArray<LocationId>;

	constructor({ players = [], connections = [], ...rest }: LocationStateProps) {
		super(rest);
		this.players = players;
		this.connections = connections;
	}

	/**
	 * Find the closest path from this location to the target location.
	 *
	 * Uses BFS to find the shortest path(s). When a scorer is provided, all shortest paths are
	 * collected and the one with the highest score is returned.
	 *
	 * @param target The location to find a path to.
	 * @param graph A location lookup used to traverse connections — pass your GameState directly.
	 * @param options Optional parameters to control different aspects of the pathfinding
	 *  algorithm, such as tie-breaking behavior and allowed connections.
	 * @returns The path from this location to the target location (excluding the origin, including
	 *  the target), or undefined if no path exists.
	 */
	tracePath(
		target: LocationId | LocationState,
		graph: LocationGraph,
		options?: PathfindingOptions
	): Path | undefined {
		const targetId = target instanceof LocationState ? target.id : target;

		if (this.id === targetId) {
			return [];
		}

		const { scorer, allowedConnections } = options ?? {};

		// BFS — allPaths maps each location to every shortest path reaching it from this location.
		// Each path is a sequence of LocationIds from the origin (exclusive) to the location (inclusive).
		const allPaths = new Map<LocationId, Path[]>([[this.id, [[]]]]);
		let frontier: LocationId[] = [this.id];

		while (frontier.length > 0) {
			const nextFrontier: LocationId[] = [];
			const nextPaths = new Map<LocationId, Path[]>();

			for (const locationId of frontier) {
				const pathsToHere = allPaths.get(locationId)!;
				const location = graph.getCard(locationId);
				if (!location) continue;

				for (const connectionId of location.connections) {
					if (allowedConnections && !allowedConnections(locationId, connectionId)) continue;
					if (allPaths.has(connectionId)) continue;

					const newPaths = pathsToHere.map((p) => [...p, connectionId]);
					const existing = nextPaths.get(connectionId);
					if (existing) {
						existing.push(...newPaths);
					} else {
						nextPaths.set(connectionId, newPaths);
						nextFrontier.push(connectionId);
					}
				}
			}

			for (const [id, paths] of nextPaths) {
				allPaths.set(id, paths);
			}

			if (nextPaths.has(targetId)) {
				const foundPaths = allPaths.get(targetId)!;
				if (!scorer || foundPaths.length === 1) return foundPaths[0];
				return foundPaths.reduce((best, p) => (scorer(p) > scorer(best) ? p : best));
			}

			frontier = nextFrontier;
		}

		return undefined;
	}

	/**
	 * Find the distance from this location to the target location, measured in number of
	 * connections.
	 * @param target The location to find the distance to.
	 * @param graph A location lookup used to traverse connections — pass your GameState directly.
	 * @param options Optional parameters to control the pathfinding algorithm.
	 * @returns The distance from this location to the target location, or undefined if no
	 *  path exists.
	 */
	distanceTo(
		target: LocationId,
		graph: LocationGraph,
		options?: Omit<PathfindingOptions, 'scorer'>
	): number | undefined {
		return this.tracePath(target, graph, options)?.length;
	}
}

export class ReadonlyLocationState extends LocationState {
	getCard(id: CardId): ReadonlyCardState | undefined {
		return super.getCard(id) as ReadonlyCardState | undefined;
	}

	requireCard(id: CardId): ReadonlyCardState {
		return super.requireCard(id) as ReadonlyCardState;
	}

	mutable(): MutableLocationState {
		return new MutableLocationState(this);
	}

	mutate(change: (state: MutableLocationState) => void): ReadonlyLocationState {
		return mutate(this as ReadonlyLocationState, change);
	}
}

export class MutableLocationState extends LocationState {
	declare clues: number;
	declare exhausted: boolean;
	declare activated: boolean;
	declare attachments: Array<MutableCardState>;
	declare properties: Array<Property>;
	declare players: Array<EntityId>;
	declare connections: Array<LocationId>;
	declare physicalTrauma: number;
	declare mentalTrauma: number;

	constructor(locationState: ReadonlyLocationState) {
		super({
			id: locationState.id,
			card: locationState.card,
			ownerId: locationState.ownerId,
			container: locationState.container,
			exhausted: locationState.exhausted,
			activated: locationState.activated,
			charges: locationState.charges,
			clues: locationState.clues,
			attachments: locationState.attachments.map((a) => (a as ReadonlyCardState).mutable()),
			properties: [...locationState.properties],
			physicalTrauma: locationState.physicalTrauma,
			mentalTrauma: locationState.mentalTrauma,
			players: [...locationState.players],
			connections: [...locationState.connections]
		});
	}

	getCard(id: CardId): MutableCardState | undefined {
		return super.getCard(id) as MutableCardState | undefined;
	}

	requireCard(id: CardId): MutableCardState {
		return super.requireCard(id) as MutableCardState;
	}

	addAttachment(gameState: MutableGameState, attachment: MutableCardState): void {
		addAttachmentToCard(this, gameState, attachment);
	}

	addProperty(property: Property): void {
		addPropertyToEntity(this, property);
	}

	moveToPlayer(gameState: MutableGameState, playerId: PlayerId): void {
		moveCardToPlayer(this, gameState, playerId);
	}

	moveToTopOfDiscardPile(gameState: MutableGameState, playerId?: PlayerId): void {
		moveCardToTopOfDiscardPile(this, gameState, playerId);
	}

	moveToBottomOfDiscardPile(gameState: MutableGameState, playerId?: PlayerId): void {
		moveCardToBottomOfDiscardPile(this, gameState, playerId);
	}

	moveToHand(gameState: MutableGameState, playerId: PlayerId): void {
		moveCardToHand(this, gameState, playerId);
	}

	moveToStage(gameState: MutableGameState, playerId: PlayerId): void {
		moveCardToStage(this, gameState, playerId);
	}

	moveToTopOfDeck(gameState: MutableGameState, playerId?: PlayerId): void {
		moveCardToTopOfDeck(this, gameState, playerId);
	}

	moveToBottomOfDeck(gameState: MutableGameState, playerId?: PlayerId): void {
		moveCardToBottomOfDeck(this, gameState, playerId);
	}

	moveToLocation(gameState: MutableGameState, locationId: LocationId): void {
		moveCardToLocation(this, gameState, locationId);
	}

	banish(gameState: MutableGameState, playerId?: PlayerId): void {
		banishCard(this, gameState, playerId);
	}

	readonly(): ReadonlyLocationState {
		return new ReadonlyLocationState({
			id: this.id,
			card: this.card,
			ownerId: this.ownerId,
			container: this.container,
			exhausted: this.exhausted,
			charges: this.charges,
			clues: this.clues,
			attachments: this.attachments.map((a) => (a as MutableCardState).readonly()),
			properties: [...this.properties],
			physicalTrauma: this.physicalTrauma,
			mentalTrauma: this.mentalTrauma,
			players: [...this.players],
			connections: [...this.connections]
		});
	}
}
