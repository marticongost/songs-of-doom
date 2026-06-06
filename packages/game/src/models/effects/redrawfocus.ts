import { ScalarExpression, type ScalarExpressionType } from '../../models/expressions/scalar';
import { Effect } from './effect';

export interface RedrawFocusEffectProps {
	/** The number of focus tokens the player can mulligan (redraw). */
	amount: ScalarExpressionType;
}

/**
 * An effect that allows a player to mulligan (redraw) a number of focus tokens,
 * discarding the drawn ones and drawing new ones instead.
 */
export class RedrawFocusEffect extends Effect {
	/** The number of focus tokens the player can mulligan (redraw). */
	readonly amount: ScalarExpressionType;

	constructor(props: RedrawFocusEffectProps) {
		super();
		this.amount = props.amount;
	}

	/*
	override async apply(gameGraph: GameGraph) {
		const [playerId] = await gameGraph.requestPlayers(undefined, {
			default: 'active-player'
		});

		const currentState = gameGraph.current.state;
		const amount = currentState.evaluate(this.amount);

		if (amount <= 0) return;

		const player = currentState.requirePlayer(playerId);
		const hand = player.focusesHand;
		const actualAmount = Math.min(amount, hand.totalCount());

		if (actualAmount === 0) return;

		const { selection } = await gameGraph.requestInput(
			[
				new FocusesField({
					name: 'selection',
					focuses: hand,
					maxTotalTokens: actualAmount,
					required: true
				})
			],
			{ playerId }
		);

		gameGraph.mutate((state) => {
			const mutablePlayer = state.requirePlayer(playerId);

			const discardedTokens = new Counter<FocusToken>();
			const drawnTokens = new Counter<FocusToken>();

			// Discard selected tokens (move from hand to discard pile)
			for (const [token, discardCount] of (selection ?? new Counter<FocusToken>()).entries()) {
				if (discardCount > 0) {
					mutablePlayer.discardFocusToken(token, discardCount);
					discardedTokens.add(token, discardCount);
				}
			}

			// Draw new tokens
			for (let i = 0; i < actualAmount; i++) {
				const token = mutablePlayer.drawFocusToken(state);
				drawnTokens.add(token);
			}

			return { discardedTokens, drawnTokens } satisfies RedrawFocusOutcome;
		});
	}
	*/
}

const isRedrawFocusAmount = (v: number | RedrawFocusEffectProps): v is number =>
	typeof v === 'number' || v instanceof ScalarExpression;

/** Creates an effect that allows a player to mulligan focus tokens. */
export const redrawFocus = (amountOrProps: number | RedrawFocusEffectProps): RedrawFocusEffect =>
	new RedrawFocusEffect(
		isRedrawFocusAmount(amountOrProps) ? { amount: amountOrProps } : amountOrProps
	);
