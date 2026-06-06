import { describe, expect, it } from 'vitest';
import { attach } from './attach';

describe('AttachEffect construction', () => {
	it('attach() creates an AttachEffect with no target and stacking=false', () => {
		const effect = attach();
		expect(effect.target).toBeUndefined();
		expect(effect.stacking).toBe(false);
	});

	it('attach({ stacking: true }) sets stacking to true', () => {
		const effect = attach({ stacking: true });
		expect(effect.stacking).toBe(true);
	});

	it('attach({}) defaults stacking to false', () => {
		const effect = attach({});
		expect(effect.stacking).toBe(false);
	});
});
