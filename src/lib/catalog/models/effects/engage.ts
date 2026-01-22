import { Effect, type EffectProps } from './effect';

/**
 * Properties for creating an EngageEffect.
 */
export interface EngageEffectProps extends EffectProps {}

/**
 * An effect that allows the player to engage an opponent, pulling them
 * into melee range within the player's threat zone.
 */
export class EngageEffect extends Effect {
	constructor(props: EngageEffectProps = {}) {
		super(props);
	}
}
