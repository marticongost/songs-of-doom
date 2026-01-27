import { Effect, type EffectProps } from './effect';

export interface DrawFocusEffectProps extends EffectProps {
	amount: number;
}

export class DrawFocusEffect extends Effect {
	readonly amount: number;

	constructor(props: DrawFocusEffectProps) {
		super(props);
		this.amount = props.amount;
	}
}
