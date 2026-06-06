import { describe, expect, it } from 'vitest';
import { Target } from '../target';
import { drawFocus } from './drawfocuseffect';

describe('DrawFocusEffect construction', () => {
	it('drawFocus(n) creates a DrawFocusEffect with the given amount', () => {
		const effect = drawFocus(3);
		expect(effect.amount).toBe(3);
		expect(effect.players).toBeUndefined();
	});

	it('drawFocus({ amount, players }) creates a DrawFocusEffect with the given props', () => {
		const players = new Target({ type: 'player' });
		const effect = drawFocus({ amount: 2, players });
		expect(effect.amount).toBe(2);
		expect(effect.players).toBe(players);
	});
});
