import { describe, expect, it } from 'vitest';
import { drawCards } from './drawcards';

describe('DrawCardsEffect construction', () => {
	it('drawCards(n) creates a DrawCardsEffect with the given amount', () => {
		const effect = drawCards(3);
		expect(effect.amount).toBe(3);
	});

	it('drawCards({ amount }) creates a DrawCardsEffect with the given amount', () => {
		const effect = drawCards({ amount: 5 });
		expect(effect.amount).toBe(5);
	});
});
