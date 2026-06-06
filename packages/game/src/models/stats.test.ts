import { describe, expect, it } from 'vitest';
import { strength } from './stats';

// ─── Stat definitions ─────────────────────────────────────────────────────────

describe('stats', () => {
	it('strength is defined with correct type', () => {
		expect(strength.type).toBe('strength');
	});
});
