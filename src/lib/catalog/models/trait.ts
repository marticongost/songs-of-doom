import { getEntryMetadata } from '..';
import type { Archetype } from './archetype';
import { Entity, type EntityProps } from './entity';
import { trait, type EntityType } from './properties';

const NOT_COMPUTED = Symbol('not computed');

export class Trait extends Entity {
	private _archetype: Archetype | undefined | typeof NOT_COMPUTED;

	override readonly type: EntityType = trait;

	constructor({ title, description, properties, capabilities, xpCost }: EntityProps<Trait>) {
		super({ title, description, properties, capabilities, xpCost: xpCost ?? 0 });
		this._archetype = NOT_COMPUTED;
	}

	isRootTrait(): boolean {
		return this.archetype === undefined;
	}

	get archetype(): Archetype | undefined {
		if (this._archetype === NOT_COMPUTED) {
			const metadata = getEntryMetadata(this);
			const i = metadata.path.length - 2;
			if (i < 0) {
				this._archetype = undefined;
			} else {
				this._archetype = metadata.catalog.require(metadata.path[i]) as Archetype;
			}
		}
		return this._archetype;
	}
}
