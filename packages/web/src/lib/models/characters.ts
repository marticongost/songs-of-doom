import { finalise } from '@songsofdoom/common';
import type { CharacterStateProps } from '@songsofdoom/game';
import { CharacterState } from '@songsofdoom/game';
import type { User } from './user';

export interface CharacterProps {
	readonly id: number;
	readonly name: string;
	readonly owner: User;
	readonly revisions: Array<CharacterRevision | CharacterRevisionProps>;
}

export class Character {
	readonly id: number;
	readonly name: string;
	readonly owner: User;
	readonly revisions: CharacterRevision[];

	constructor({ id, name, owner, revisions }: CharacterProps) {
		this.id = id;
		this.name = name;
		this.owner = owner;
		this.revisions = revisions.map((revision) => finalise(CharacterRevision, revision));
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
