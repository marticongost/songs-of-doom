import { Effect, type EffectProps } from './effect';

export interface DrawAptitudeEffectProps extends EffectProps {
	amount: number;
}

export class DrawAptitudeEffect extends Effect {
	readonly amount: number;

	constructor(props: DrawAptitudeEffectProps) {
		super(props);
		this.amount = props.amount;
	}
}
