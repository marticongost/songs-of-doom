import { finalise } from '@songsofdoom/common';
import { rollbackEffect, type GameGraph } from '../game/gamegraph';
import type { CardId } from '../game/identifiers';
import { Target, type TargetSpec } from '../target';
import { Effect } from './effect';

/**
 * Props for configuring an ExhaustEffect.
 */
export interface ExhaustEffectProps {
	/** The target to exhaust. Defaults to the card's default target if not specified. */
	target?: TargetSpec;
}

export interface ExhaustOutcome {
	/** The card that was exhausted. */
	card?: CardId;
}

/**
 * An effect that exhausts the target.
 */
export class ExhaustEffect extends Effect {
	/** The target to exhaust. */
	readonly target?: Target;

	constructor({ target }: ExhaustEffectProps) {
		super();
		this.target = finalise(Target, target);
	}

	override async apply(gameGraph: GameGraph) {
		const cardId = (await gameGraph.requestSingleTarget(this.target, {
			default: 'active-card'
		})) as CardId;
		gameGraph.mutate((state) => {
			const card = state.requireCard(cardId);
			if (card.exhausted) {
				rollbackEffect();
			}
			card.exhausted = true;
			return { card: cardId };
		});
	}
}

/** Creates an effect that exhausts a target. */
export const exhaust = (props: ExhaustEffectProps = {}): ExhaustEffect => new ExhaustEffect(props);
