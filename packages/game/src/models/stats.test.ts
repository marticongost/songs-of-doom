import { describe, expect, it } from 'vitest';
import { mock } from '@songsofdoom/common/test-utils';
import type { GameState } from './game/gamestate';
import type { PlayerState } from './game/playerstate';
import { strength } from './stats';

// ─── Stat.evaluate ────────────────────────────────────────────────────────────

describe('Stat.evaluate', () => {
	it('returns the active player stat value', () => {
		const player = mock<PlayerState>({
			getStat: (stat) => (stat === strength ? 4 : 0)
		});
		const state = mock<GameState>({
			requireActivePlayer: () => player
		});
		expect(strength.evaluate(state)).toBe(4);
	});
});
