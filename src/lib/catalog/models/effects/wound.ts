import { finalise } from '$lib/modelling';
import { Target, type TargetProps } from '../target';
import { Effect } from './effect';

export interface WoundEffectProps {
	damanage: number;
	target: TargetProps | Target;
}

export class WoundEffect extends Effect {
	readonly damanage: number;
	readonly target: Target;

	constructor({ damanage, target }: WoundEffectProps) {
		super();
		this.damanage = damanage;
		this.target = finalise(Target, target);
	}
}
