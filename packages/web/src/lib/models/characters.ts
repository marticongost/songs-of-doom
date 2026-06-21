import { finalise } from '@songsofdoom/common';
import { CharacterState, type CharacterStateProps } from '@songsofdoom/game';
import type { User } from './user';

export interface CharacterProps {
	readonly id: number;
	readonly owner: User;
	readonly revisions: Array<CharacterRevision | CharacterRevisionProps>;
}

export class Character {
	readonly id: number;
	readonly owner: User;
	readonly revisions: CharacterRevision[];

	constructor({ id, owner, revisions }: CharacterProps) {
		this.id = id;
		this.owner = owner;
		this.revisions = revisions.map((revision) => finalise(CharacterRevision, revision));
	}

	/** The display name of the character, sourced from the latest revision's state. */
	get name(): string {
		return this.newestRevision.state.name;
	}

	get newestRevision(): CharacterRevision {
		return this.revisions[this.revisions.length - 1];
	}

	get totalXp(): number {
		return this.newestRevision.totalXp;
	}

	get lastModified(): Date {
		return this.newestRevision.createdAt;
	}
}

export interface CharacterRevisionProps {
	readonly number: number;
	readonly createdAt: Date;
	readonly finalised: boolean;
	readonly totalXp: number;
	readonly state: CharacterState | CharacterStateProps;
}

export class CharacterRevision {
	readonly number: number;
	readonly createdAt: Date;
	readonly finalised: boolean;
	readonly totalXp: number;
	readonly state: CharacterState;

	constructor({ number, createdAt, finalised, totalXp, state }: CharacterRevisionProps) {
		this.number = number;
		this.createdAt = createdAt;
		this.finalised = finalised;
		this.totalXp = totalXp;
		this.state = finalise(CharacterState, state);
	}
}
