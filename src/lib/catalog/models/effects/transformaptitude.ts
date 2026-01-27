import type { Aptitude, AptitudeType } from '../aptitude';
import { Effect, type EffectProps } from './effect';

/**
 * Properties for creating a TransformAptitudeEffect.
 */
export interface TransformAptitudeEffectProps extends EffectProps {
	/**
	 * The source aptitude to transform from.
	 * Can be either an Aptitude object or an AptitudeType string.
	 */
	source?: Aptitude | AptitudeType;

	/**
	 * The target aptitude to transform into.
	 * Can be either an Aptitude object or an AptitudeType string.
	 * The transformed aptitude will have the same value as the source.
	 */
	target: Aptitude | AptitudeType;
}

/**
 * Represents an effect that transforms an aptitude to another of the same value and different type
 * while paying for a capability.
 *
 * This effect allows a character to convert one type of aptitude into another, maintaining the
 * same numerical value but changing the aptitude type. This is useful for abilities that let
 * players adapt their character's strengths to different situations.
 */
export class TransformAptitudeEffect extends Effect {
	/**
	 * The source aptitude to transform from.
	 */
	readonly source: Aptitude | AptitudeType;

	/**
	 * The target aptitude to transform into.
	 */
	readonly target: Aptitude | AptitudeType;

	constructor(props: TransformAptitudeEffectProps) {
		super(props);
		this.source = props.source ?? 'any';
		this.target = props.target;
	}
}
