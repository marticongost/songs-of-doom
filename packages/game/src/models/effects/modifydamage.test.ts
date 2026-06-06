import { describe, expect, it } from 'vitest';
import { modifyDamage } from './modifydamage';

describe('modifyDamage factory', () => {
	it('modifyDamage(n) creates an effect with the given damage', () => {
		expect(modifyDamage(2).amount).toBe(2);
	});

	it('modifyDamage({ amount}) creates an effect with the given damage', () => {
		expect(modifyDamage({ amount: 4 }).amount).toBe(4);
	});
});
