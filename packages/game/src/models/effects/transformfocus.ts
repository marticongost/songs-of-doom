import type { Focus, FocusType } from '../focus';
import { Effect } from './effect';

/**
 * Properties for creating a TransformFocusEffect.
 */
export interface TransformFocusEffectProps {
	/**
	 * The source focus to transform from.
	 * Can be either a Focus object or a FocusType string.
	 */
	source?: Focus | FocusType;

	/**
	 * The target focus to transform into.
	 * Can be either a Focus object or a FocusType string.
	 * The transformed focus will have the same value as the source.
	 */
	target: Focus | FocusType;
}

/**
 * Represents an effect that transforms a focus to another of the same value and different type
 * while paying for a capability.
 *
 * This effect allows a character to convert one type of focus into another, maintaining the
 * same numerical value but changing the focus type. This is useful for abilities that let
 * players adapt their character's strengths to different situations.
 */
export class TransformFocusEffect extends Effect {
	/**
	 * The source focus to transform from.
	 */
	readonly source: Focus | FocusType;

	/**
	 * The target focus to transform into.
	 */
	readonly target: Focus | FocusType;

	constructor({ source, target }: TransformFocusEffectProps) {
		super();
		this.source = source ?? 'any';
		this.target = target;
	}
}
