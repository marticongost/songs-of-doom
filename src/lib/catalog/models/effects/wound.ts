import { finalise } from '$lib/modelling';
import { Target, type TargetProps } from '../target';

export interface WoundEffectProps {
	damanage: number;
	target: TargetProps | Target;
}

export class WoundEffect {
	readonly damanage: number;
	readonly target: Target;

	constructor({ damanage, target }: WoundEffectProps) {
		this.damanage = damanage;
		this.target = finalise(Target, target);
	}
}
