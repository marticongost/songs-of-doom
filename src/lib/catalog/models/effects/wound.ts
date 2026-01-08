import { finalise } from '$lib/modelling';
import { Target, type TargetProps } from '../target';
import { Effect, type EffectProps } from './effect';

export interface WoundEffectProps extends EffectProps {
	damanage: number;
	target: TargetProps | Target;
}

export class WoundEffect extends Effect {
	readonly damanage: number;
	readonly target: Target;

	constructor({ damanage, target, properties }: WoundEffectProps) {
		super({ properties });
		this.damanage = damanage;
		this.target = finalise(Target, target);
	}
}
