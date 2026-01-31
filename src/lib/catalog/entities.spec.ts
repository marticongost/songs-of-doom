import { describe, expect, it } from 'vitest';
import { entities } from './entities';

describe('catalog entities', () => {
	describe('multi-variant entities', () => {
		it('should have different xpCost for each variant', () => {
			const baseEntities = entities
				.all()
				.filter((entity) => entity.variants.length > 1 && entity.level === 1);

			expect(baseEntities.length).toBeGreaterThan(0);

			for (const entity of baseEntities) {
				const xpCosts = entity.variants.map((v) => v.xpCost);
				const uniqueCosts = new Set(xpCosts);
				expect(
					uniqueCosts.size,
					`'${entity.title.en}' variants have duplicate xpCost values: [${xpCosts.join(', ')}]`
				).toBe(xpCosts.length);
			}
		});
	});
});
