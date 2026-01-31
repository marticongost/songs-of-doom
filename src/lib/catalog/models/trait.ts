import { getEntryMetadata } from '..';
import archetype from '../data/properties/archetype';
import trait from '../data/properties/trait';
import { Entity, type EntityProps, type EntityType } from './entity';
import type { Property } from './properties';

const NOT_COMPUTED = Symbol('not computed');

export class Trait extends Entity {
	private _archetype: Trait | undefined | typeof NOT_COMPUTED;
	private _isArchetype: boolean | typeof NOT_COMPUTED;
	private _children: Array<Entity> | typeof NOT_COMPUTED;

	constructor({ title, description, properties, capabilities, xpCost }: EntityProps<Trait>) {
		super({ title, description, properties, capabilities, xpCost: xpCost ?? 0 });
		this._archetype = NOT_COMPUTED;
		this._isArchetype = NOT_COMPUTED;
		this._children = NOT_COMPUTED;
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
				this._archetype = metadata.catalog.require(metadata.path[i]) as Trait;
			}
		}
		return this._archetype;
	}

	override get type(): EntityType {
		return this.isArchetype ? 'archetype' : 'trait';
	}

	get children(): Array<Entity> {
		if (this._children === NOT_COMPUTED) {
			this._children = getEntryMetadata(this)
				.catalog.all()
				.filter((trait) => trait.archetype === this);
		}
		return this._children;
	}

	getChildrenOfType(type: EntityType): Array<Entity> {
		return this.children.filter((child) => child.type === type);
	}

	override getImplicitProperties(): Array<Property> {
		const implicitTraits = [trait];
		if (this.isArchetype) {
			implicitTraits.push(archetype);
		}
		return implicitTraits;
	}
}
