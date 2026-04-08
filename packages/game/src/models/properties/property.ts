import type { LocalisedText } from '@songsofdoom/common/localisation';
import { BooleanExpression } from '../expressions';
import type { GameState } from '../game/gamestate';

export interface PropertyProps {
	title: LocalisedText;
	description?: LocalisedText;
}

export abstract class Property extends BooleanExpression {
	readonly title: LocalisedText;
	readonly description?: LocalisedText;

	constructor(props: PropertyProps) {
		super();
		this.title = props.title;
		this.description = props.description;
	}

	override evaluate(_state: GameState): boolean {
		// TODO: choose the current target
		return false;
	}

	is(property: Property): boolean {
		return this === property;
	}

	/**
	 * Merges this property with another property of the same concrete type.
	 *
	 * The base implementation is a no-op and returns the current instance.
	 * Subclasses can override to combine property-specific state.
	 *
	 * @param _other Another property instance to merge with.
	 * @returns The merged property instance.
	 */
	merge(_other: this): this {
		return this;
	}
}
