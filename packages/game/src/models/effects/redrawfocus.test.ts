import { describe, expect, it } from 'vitest';
import { redrawFocus } from './redrawfocus';

// --- RedrawFocusEffect construction ------------------------------------------------

describe('RedrawFocusEffect construction', () => {
	it('redrawFocus(n) creates a RedrawFocusEffect with the given amount', () => {
		const effect = redrawFocus(3);
		expect(effect.amount).toBe(3);
	});

	it('redrawFocus({ amount }) creates a RedrawFocusEffect with the given props', () => {
		const effect = redrawFocus({ amount: 2 });
		expect(effect.amount).toBe(2);
	});
});
