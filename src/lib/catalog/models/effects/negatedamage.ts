import { Effect, type EffectProps } from './effect';

/**
 * Props for configuring a NegateDamageEffect.
 */
export interface NegateDamageEffectProps extends EffectProps {}

/**
 * An effect that completely negates all damage from an attack, reducing it to zero.
 * This effect cancels any incoming damage before it is applied.
 */
export class NegateDamageEffect extends Effect {
	constructor(props: NegateDamageEffectProps = {}) {
		super(props);
	}
}
