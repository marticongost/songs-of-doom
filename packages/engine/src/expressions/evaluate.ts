import { extensionMethod } from '@songsofdoom/common';
import type { CardState } from '../state/cardstate';
import type { GameState } from '../state/gamestate';
import type { LocationState } from '../state/locationstate';
import type { PlayerState } from '../state/playerstate';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type State = GameState<CardState<any>, PlayerState<CardState<any>>, LocationState>;

/**
 * Extension method that evaluates a boolean expression in the context of a {@link GameState}.
 *
 * Implementations are registered per expression type via {@link ExtensionMethod.implementFor}.
 * {@link GameState.evaluateBoolean} delegates to this extension method after handling primitive
 * boolean literals.
 */
export const evaluateBoolean = extensionMethod<State, boolean>();

/**
 * Extension method that evaluates a scalar expression in the context of a {@link GameState}.
 *
 * Implementations are registered per expression type via {@link ExtensionMethod.implementFor}.
 * {@link GameState.evaluateScalar} delegates to this extension method after handling primitive
 * number literals.
 */
export const evaluateScalar = extensionMethod<State, number>();
