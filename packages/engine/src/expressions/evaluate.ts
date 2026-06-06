import { extensionMethod } from '@songsofdoom/common';
import type { ActualCapabilityCost } from '@songsofdoom/game';
import type { CardState } from '../state/cardstate';
import type { GameState } from '../state/gamestate';
import type { LocationState } from '../state/locationstate';
import type { PlayerState } from '../state/playerstate';

/**
 * Extension method that evaluates an expression in the context of a {@link GameState}.
 *
 * Implementations are registered per expression type via {@link ExtensionMethod.implementFor}.
 * {@link GameState.evaluate} delegates to this extension method after handling primitive values
 * (boolean literals, number literals).
 */
export const evaluate = extensionMethod<
	GameState<CardState<any>, PlayerState<CardState<any>>, LocationState>,
	boolean | number | ActualCapabilityCost
>();
