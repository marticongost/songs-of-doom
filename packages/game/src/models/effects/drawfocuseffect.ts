import type { GameGraph } from '../game/gamegraph';
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

	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<DrawFocusEffect>(this, (_state) => {
			// TODO
		});
	}
}

/** Creates an effect that draws focus. */
export const drawFocus = (amountOrProps: number | DrawFocusEffectProps): DrawFocusEffect =>
	new DrawFocusEffect(
		typeof amountOrProps === 'number' ? { amount: amountOrProps } : amountOrProps
	);
