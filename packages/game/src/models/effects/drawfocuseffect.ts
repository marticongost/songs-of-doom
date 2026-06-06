import type { PlayerTargetType, Target } from '../target';
import { Effect } from './effect';

export interface DrawFocusEffectProps {
	/** The amount of focus tokens to draw. */
	amount: number;

	/** Which players are affected by the effect. */
	players?: Target<PlayerTargetType>;
}

export class DrawFocusEffect extends Effect {
	/** The amount of focus tokens to draw. */
	readonly amount: number;

	/** Which players are affected by the effect. */
	readonly players?: Target<PlayerTargetType>;

	constructor(props: DrawFocusEffectProps) {
		super();
		this.amount = props.amount;
		this.players = props.players;
	}
}

/** Creates an effect that draws focus. */
export const drawFocus = (amountOrProps: number | DrawFocusEffectProps): DrawFocusEffect =>
	new DrawFocusEffect(
		typeof amountOrProps === 'number' ? { amount: amountOrProps } : amountOrProps
	);
