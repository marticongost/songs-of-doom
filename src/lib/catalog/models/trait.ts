import { getEntryMetadata } from '..';
import { Entity, type EntityProps } from './entity';

const NOT_COMPUTED = Symbol('not computed');

export class Trait extends Entity {
	private _archetype: Trait | undefined | typeof NOT_COMPUTED;
	private _isArchetype: boolean | typeof NOT_COMPUTED;
	private _subtraits: Array<Trait> | typeof NOT_COMPUTED;

	constructor({ title, description, properties, capabilities }: EntityProps) {
		super({ title, description, properties, capabilities });
		this._archetype = NOT_COMPUTED;
		this._isArchetype = NOT_COMPUTED;
		this._subtraits = NOT_COMPUTED;
	}

	isRootTrait(): boolean {
		return this.archetype === undefined;
	}

	get isArchetype(): boolean {
		if (this._isArchetype === NOT_COMPUTED) {
			const metadata = getEntryMetadata(this);
			this._isArchetype =
				metadata.path.length >= 2 &&
				metadata.path[metadata.path.length - 1] === metadata.path[metadata.path.length - 2];
		}
		return this._isArchetype;
	}

	get archetype(): Trait | undefined {
		if (this._archetype === NOT_COMPUTED) {
			const metadata = getEntryMetadata(this);
			let i = metadata.path.length - 2;
			if (this.isArchetype) {
				i--;
			}
			if (i < 0) {
				this._archetype = undefined;
			} else {
				this._archetype = metadata.catalog.require(metadata.path[i]);
			}
		}
		return this._archetype;
	}

	get subtraits(): Array<Trait> {
		if (this._subtraits === NOT_COMPUTED) {
			this._subtraits = getEntryMetadata(this)
				.catalog.all()
				.filter((trait) => trait.archetype === this);
		}
		return this._subtraits;
	}
}
