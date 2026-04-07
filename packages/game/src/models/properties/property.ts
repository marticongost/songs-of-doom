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
}
