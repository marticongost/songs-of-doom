import { finalise } from '$lib/modelling';
import type { Property } from '../properties';
import { Target, type TargetProps } from '../target';
import { Effect } from './effect';

export interface WoundEffectProps {
	damage: number;
	target: TargetProps | Target;
	properties?: Array<Property>;
}

export class WoundEffect extends Effect {
	readonly damage: number;
	readonly target: Target;
	readonly properties: Array<Property>;

	constructor({ damage, target, properties }: WoundEffectProps) {
		super();
		this.damage = damage;
		this.target = finalise(Target, target);
		this.properties = properties ?? [];
	}
}
