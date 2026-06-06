import { describe, expect, it } from 'vitest';
import { Target } from '../target';
import { discardFromHand } from './discardfromhand';

// ─── DiscardFromHandEffect construction ──────────────────────────────────────

describe('DiscardFromHandEffect construction', () => {
	it('discardFromHand() creates a DiscardFromHandEffect with default cards target', () => {
		const effect = discardFromHand();
		expect(effect.players).toBeUndefined();
		expect(effect.cards).toBeInstanceOf(Target);
		expect(effect.cards.cardinality.min).toBe(1);
		expect(effect.cards.cardinality.max).toBe(1);
	});
});
