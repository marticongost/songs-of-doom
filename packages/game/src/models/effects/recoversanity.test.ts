import { describe, expect, it } from 'vitest';
import { Target } from '../target';
import { recoverSanity } from './recoversanity';

// ─── RecoverSanityEffect construction ────────────────────────────────────────

describe('RecoverSanityEffect construction', () => {
	it('recoverSanity(N) creates an effect with the given amount and no target', () => {
		const effect = recoverSanity(2);
		expect(effect.amount).toBe(2);
		expect(effect.target).toBeUndefined();
	});

	it('recoverSanity({ amount }) creates an effect with the given amount', () => {
		const effect = recoverSanity({ amount: 3 });
		expect(effect.amount).toBe(3);
		expect(effect.target).toBeUndefined();
	});

	it('recoverSanity({ amount, target }) creates an effect with the given amount and target', () => {
		const target = new Target({});
		const effect = recoverSanity({ amount: 2, target });
		expect(effect.amount).toBe(2);
		expect(effect.target).toBe(target);
	});
});
