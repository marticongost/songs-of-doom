import { Effect, type EffectProps } from './effect';

export type RepeatCapabilityEffectProps = EffectProps;

export class RepeatCapabilityEffect extends Effect {
	constructor({ properties }: RepeatCapabilityEffectProps = {}) {
		super({ properties });
	}
}
