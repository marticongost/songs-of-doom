import { describe, expect, it } from 'vitest';
import { Target } from '../target';
import { exhaust } from './exhaust';

// ─── ExhaustEffect construction ───────────────────────────────────────────────

describe('ExhaustEffect construction', () => {
	it('exhaust() creates an ExhaustEffect with no target', () => {
		const effect = exhaust();
		expect(effect.target).toBeUndefined();
	});

	it('exhaust({ target }) creates an ExhaustEffect with the given target', () => {
		const target = new Target({});
		const effect = exhaust({ target });
		expect(effect.target).toBe(target);
	});
});
