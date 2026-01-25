import { finalise } from '$lib/modelling';
import { Target, type TargetProps } from '../target';
import { Effect, type EffectProps } from './effect';

export interface WoundEffectProps extends EffectProps {
	damage: number;
	target: TargetProps | Target;
}

export class WoundEffect extends Effect {
	readonly damage: number;
	readonly target: Target;

	constructor({ damage, target, properties }: WoundEffectProps) {
		super({ properties });
		this.damage = damage;
		this.target = finalise(Target, target);
	}
}
