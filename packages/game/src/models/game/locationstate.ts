import {
	CardState,
	type CardStateProps,
	type MutableCardState,
	type ReadonlyCardState
} from './cardstate';
import type { CardId, LocationId, PlayerId } from './identifiers';
import { mutate } from './mutate';

export interface LocationStateProps extends Omit<CardStateProps, 'id'> {
	id: LocationId;
	/** The ids of the players currently at this location. */
	players?: ReadonlyArray<PlayerId>;
}

export class LocationState extends CardState {
	declare readonly id: LocationId;
	/** The ids of the players currently at this location. */
	readonly players: ReadonlyArray<PlayerId>;

	constructor({ players = [], ...rest }: LocationStateProps) {
		super(rest);
		this.players = players;
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
	declare attachments: Array<MutableCardState>;
	declare players: Array<PlayerId>;

	constructor(locationState: ReadonlyLocationState) {
		super({
			id: locationState.id,
			card: locationState.card,
			ownerId: locationState.ownerId,
			container: locationState.container,
			exhausted: locationState.exhausted,
			charges: locationState.charges,
			clues: locationState.clues,
			attachments: locationState.attachments.map((a) => (a as ReadonlyCardState).mutable()),
			properties: [...locationState.properties],
			physicalTrauma: locationState.physicalTrauma,
			mentalTrauma: locationState.mentalTrauma,
			players: [...locationState.players]
		});
	}

	getCard(id: CardId): MutableCardState | undefined {
		return super.getCard(id) as MutableCardState | undefined;
	}

	requireCard(id: CardId): MutableCardState {
		return super.requireCard(id) as MutableCardState;
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
			players: [...this.players]
		});
	}
}
