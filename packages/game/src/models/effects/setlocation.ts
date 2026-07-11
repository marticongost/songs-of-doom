import { finalise } from '@songsofdoom/common';
import type { LocationTargetType, TargetSpec } from '../target';
import { Target } from '../target';
import { Effect } from './effect';

/**
 * Props for configuring a SetLocationEffect.
 */
export interface SetLocationEffectProps {
	/** The entities that move. Defaults to the current subject. */
	target?: TargetSpec;

	/** The location to move to. */
	destination: TargetSpec<LocationTargetType>;
}

/**
 * An effect that moves a card or player to a specified location.
 */
export class SetLocationEffect extends Effect {
	/** The entities that move. Defaults to the current subject. */
	readonly target?: Target;

	/** The location to move to. */
	readonly destination: Target;

	constructor({ target, destination }: SetLocationEffectProps) {
		super();
		this.target = finalise(Target, target);
		this.destination = finalise(Target, destination);
	}
}

/** Creates an effect that moves a card or player to a specified location. */
export const setLocation = (props: SetLocationEffectProps): SetLocationEffect =>
	new SetLocationEffect(props);
