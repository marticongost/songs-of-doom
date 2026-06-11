import { finalise } from '@songsofdoom/common';
import { Target, type ActorTargetType, type TargetSpec } from '../target';
import { Effect } from './effect';

export interface EngageEffectProps {
	/** The target(s) to engage. */
	target: TargetSpec<ActorTargetType>;
}

/**
 * An effect that allows an entity to engage an opponent, pulling them
 * into melee range within the opponent's threat zone.
 */
export class EngageEffect extends Effect {
	/** The target(s) to engage. */
	readonly target: Target<ActorTargetType>;

	constructor({ target }: EngageEffectProps) {
		super();
		this.target = finalise(Target, target);
	}
}

/**
 * Creates an effect that engages an opponent.
 */
export const engage = (props: EngageEffectProps): EngageEffect => new EngageEffect(props);
