import type { GameStore } from '$lib/game/GameStore.svelte';
import { getContext, setContext } from 'svelte';

const GAME_STORE_KEY = Symbol('game-store');

/**
 * Set the {@link GameStore} instance in the current component's Svelte context.
 *
 * Call this once in the game route layout.  Descendant components retrieve
 * the store via {@link getGameStore}.
 */
export function setGameStore(store: GameStore): void {
	setContext(GAME_STORE_KEY, store);
}

/**
 * Retrieve the {@link GameStore} from the nearest ancestor's Svelte context.
 *
 * Throws if no ancestor has called {@link setGameStore}.
 */
export function getGameStore(): GameStore {
	return getContext<GameStore>(GAME_STORE_KEY);
}
