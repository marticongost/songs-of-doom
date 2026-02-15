import { Effect } from './effect';

export interface DrawFocusEffectProps {
	amount: number;
}

export class DrawFocusEffect extends Effect {
	readonly amount: number;

	constructor(props: DrawFocusEffectProps) {
		super();
		this.amount = props.amount;
	}
}
