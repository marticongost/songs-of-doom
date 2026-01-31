import { getEntryMetadata } from '..';
import { Entity, type EntityProps } from './entity';
import { archetype, type EntityType } from './properties';

const NOT_COMPUTED = Symbol('not computed');

export class Archetype extends Entity {
	private _archetype: Archetype | undefined | typeof NOT_COMPUTED;
	private _children: Array<Entity> | typeof NOT_COMPUTED;

	override readonly type: EntityType = archetype;

	constructor(baseProps: EntityProps<Archetype>) {
		super(baseProps);
		this._archetype = NOT_COMPUTED;
		this._children = NOT_COMPUTED;
	}

	override get archetype(): Archetype | undefined {
		if (this._archetype === NOT_COMPUTED) {
			const metadata = getEntryMetadata(this);
			const i = metadata.path.length - 3;
			if (i < 0) {
				this._archetype = undefined;
			} else {
				this._archetype = metadata.catalog.require(metadata.path[i]) as Archetype;
			}
		}
		return this._archetype;
	}

	get children(): Array<Entity> {
		if (this._children === NOT_COMPUTED) {
			this._children = getEntryMetadata(this)
				.catalog.all()
				.filter((entity) => entity.archetype === this);
		}
		return this._children;
	}

	getChildrenOfType(type: EntityType): Array<Entity> {
		return this.children.filter((child) => child.type === type);
	}
}
