import type { LocalisedText } from '$lib/localisation';
import { getEntryMetadata } from '..';
import type { Capability } from './capability';
import type { Property } from './properties';

export interface TraitProps {
	title: LocalisedText;
	description?: LocalisedText;
	properties?: Array<Property>;
	capabilities?: Array<Capability>;
}

const NOT_COMPUTED = Symbol('not computed');

export class Trait {
	readonly title: LocalisedText;
	readonly description?: LocalisedText;
	readonly properties: Array<Property>;
	readonly capabilities: Array<Capability>;
	private _archetype: Trait | undefined | typeof NOT_COMPUTED;
	private _subtraits: Array<Trait> | typeof NOT_COMPUTED;

	constructor({ title, description, properties, capabilities }: TraitProps) {
		this.title = title;
		this.description = description;
		this.properties = properties ?? [];
		this.capabilities = capabilities ?? [];
		this._archetype = NOT_COMPUTED;
		this._subtraits = NOT_COMPUTED;
	}

	isRootTrait(): boolean {
		return this.archetype === undefined;
	}

	get archetype(): Trait | undefined {
		if (this._archetype === NOT_COMPUTED) {
			const metadata = getEntryMetadata(this);
			if (
				metadata.path.length < 2 ||
				metadata.path[metadata.path.length - 1] === metadata.path[metadata.path.length - 2]
			) {
				this._archetype = undefined;
			} else {
				const archetypeId = metadata.path[metadata.path.length - 2];
				this._archetype = metadata.catalog.require(archetypeId);
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
