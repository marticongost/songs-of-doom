import { describe, expect, it } from 'vitest';
import { Target } from '../target';
import { engage } from './engage';

// ─── EngageEffect construction ─────────────────────────────────────────────────

describe('EngageEffect construction', () => {
	it('engage({ target }) creates an EngageEffect with the given target', () => {
		const target = new Target({ type: 'player' });
		const effect = engage({ target });
		expect(effect.target).toBe(target);
	});
});
