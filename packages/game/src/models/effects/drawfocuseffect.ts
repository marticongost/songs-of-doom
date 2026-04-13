import { Counter, ReadonlyCounter } from '@songsofdoom/common';
import type { FocusToken } from '../..';
import type { GameGraph } from '../game/gamegraph';
import type { PlayerId } from '../game/identifiers';
import type { PlayerTargetType, Target } from '../target';
import { EffectWithOutcome } from './effect';

export interface DrawFocusEffectProps {
	/** The amount of focus tokens to draw. */
	amount: number;

	/** Which players are affected by the effect. */
	players?: Target<PlayerTargetType>;
}

export interface DrawFocusOutcome {
	/** The focus tokens that were drawn. */
	readonly playerDrawnTokens: ReadonlyMap<PlayerId, ReadonlyCounter<FocusToken>>;
}

export class DrawFocusEffect extends EffectWithOutcome<DrawFocusOutcome> {
	/** The amount of focus tokens to draw. */
	readonly amount: number;

	/** Which players are affected by the effect. */
	readonly players?: Target<PlayerTargetType>;

	constructor(props: DrawFocusEffectProps) {
		super();
		this.amount = props.amount;
		this.players = props.players;
	}

	override async trigger(gameGraph: GameGraph) {
		const playerIds = await gameGraph.requestPlayers(this.players, {
			default: () => [gameGraph.current.state.requireActivePlayer().id]
		});
		gameGraph.effectTriggered<DrawFocusEffect>(this, (state) => {
			const playerDrawnTokens = new Map<PlayerId, Counter<FocusToken>>();
			for (const playerId of playerIds) {
				const playerState = state.requirePlayer(playerId);
				for (let i = 0; i < this.amount; i++) {
					const token = playerState.drawFocusToken(state);
					let counter = playerDrawnTokens.get(playerId);
					if (!counter) {
						counter = new Counter<FocusToken>();
						playerDrawnTokens.set(playerId, counter);
					}
					counter.add(token);
				}
			}
			return { playerDrawnTokens };
		});
	}
}

/** Creates an effect that draws focus. */
export const drawFocus = (amountOrProps: number | DrawFocusEffectProps): DrawFocusEffect =>
	new DrawFocusEffect(
		typeof amountOrProps === 'number' ? { amount: amountOrProps } : amountOrProps
	);
