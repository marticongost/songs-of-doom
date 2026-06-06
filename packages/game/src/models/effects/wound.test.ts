import { describe, expect, it } from 'vitest';
import { distance } from '../expressions/scalar/distance';
import { Target } from '../target';
import { wound } from './wound';

describe('wound() factory — literal damage', () => {
	it('wound(n) creates an effect with numeric damage', () => {
		expect(wound(3).damage).toBe(3);
	});

	it('wound(n) defaults causedByAttack to false', () => {
		expect(wound(3).causedByAttack).toBe(false);
	});

	it('wound(n) defaults properties to empty array', () => {
		expect(wound(3).properties).toEqual([]);
	});

	it('wound(n) has no target by default', () => {
		expect(wound(3).target).toBeUndefined();
	});
});

describe('wound() factory — expression damage', () => {
	it('wound(scalarExpression) creates a WoundEffect with that expression as damage', () => {
		expect(wound(distance).damage).toBe(distance);
	});

	it('wound(scalarExpression) defaults causedByAttack to false', () => {
		expect(wound(distance).causedByAttack).toBe(false);
	});

	it('wound(scalarExpression) defaults properties to empty array', () => {
		expect(wound(distance).properties).toEqual([]);
	});

	it('wound(scalarExpression) has no target by default', () => {
		expect(wound(distance).target).toBeUndefined();
	});
});

describe('wound() factory — props object', () => {
	it('wound({ damage }) accepts a numeric damage prop', () => {
		const effect = wound({ damage: 4 });
		expect(effect.damage).toBe(4);
	});

	it('wound({ damage }) accepts a scalar expression as damage', () => {
		const effect = wound({ damage: distance });
		expect(effect.damage).toBe(distance);
	});

	it('wound({ damage, causedByAttack: true }) sets causedByAttack', () => {
		const effect = wound({ damage: 2, causedByAttack: true });
		expect(effect.causedByAttack).toBe(true);
	});

	it('wound({ damage }) defaults causedByAttack to false', () => {
		const effect = wound({ damage: 2 });
		expect(effect.causedByAttack).toBe(false);
	});

	it('wound({ damage, target }) creates a WoundEffect with a Target', () => {
		const target = new Target({});
		const effect = wound({ damage: 1, target });
		expect(effect.target).toBe(target);
	});

	it('wound({ damage }) has no target by default', () => {
		const effect = wound({ damage: 1 });
		expect(effect.target).toBeUndefined();
	});
});
