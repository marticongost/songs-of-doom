import type { DrawFocusEffect } from '@songsofdoom/game';
import { Counter } from '../../../../common/src/counter';
import type { FocusToken } from '../../../../game/src/models/focus';
import { instructions, type EffectProcedureState } from '../../core/instructions';
import { ProcedureId } from '../../core/procedureid';
import type { EntityId, PlayerId } from '../../state/identifiers';

export interface DrawFocusState extends EffectProcedureState<DrawFocusEffect> {
	/** The players affected by the effect. */
	playerIds?: PlayerId[];

	/** The tokens drawn by each player. */
	playerDrawnTokens?: Map<PlayerId, Counter<FocusToken>>;
}

const { define, resolveTargetList } = instructions<DrawFocusState>();

export const drawFocusEffectProc = define({
	id: ProcedureId.DrawFocusEffect,
	steps: {
		selectPlayers: resolveTargetList(
			({ effect }) => effect.players ?? 'active-player',
			'playerIds'
		),
		drawTokens(state) {
			const { game, playerIds, effect } = state;
			const playerDrawnTokens = new Map<EntityId, Counter<FocusToken>>();
			const mutatedGameState = game.mutate((gameState) => {
				for (const playerId of playerIds!) {
					const playerState = gameState.requirePlayer(playerId);
					for (let i = 0; i < effect.amount; i++) {
						const token = playerState.drawFocusToken(gameState);
						let counter = playerDrawnTokens.get(playerId);
						if (!counter) {
							counter = new Counter<FocusToken>();
							playerDrawnTokens.set(playerId, counter);
						}
						counter.add(token);
					}
				}
			});
			return { ...state, game: mutatedGameState, playerDrawnTokens };
		}
	}
});
