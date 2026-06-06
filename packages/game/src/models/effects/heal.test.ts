import { describe, expect, it } from 'vitest';
import { Target } from '../target';
import { heal } from './heal';

describe('HealEffect construction', () => {
	it('heal(2) creates a HealEffect with the given amount and no target', () => {
		const effect = heal(2);
		expect(effect.amount).toBe(2);
		expect(effect.target).toBeUndefined();
	});

	it('heal({ amount }) creates a HealEffect with the given amount and no target', () => {
		const effect = heal({ amount: 3 });
		expect(effect.amount).toBe(3);
		expect(effect.target).toBeUndefined();
	});

	it('heal({ amount, target }) creates a HealEffect with the given amount and target', () => {
		const target = new Target({ type: 'player' });
		const effect = heal({ amount: 2, target });
		expect(effect.amount).toBe(2);
		expect(effect.target).toBe(Target);
	});
});
