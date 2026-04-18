import { describe, expect, it } from 'vitest';
import { distance } from '../expressions/scalar/distance';
import { Target } from '../target';
import { WoundEffect, wound } from './wound';

// ─── wound() factory — literal damage ────────────────────────────────────────

describe('wound() factory — literal damage', () => {
	it('wound(n) creates a WoundEffect with numeric damage', () => {
		const effect = wound(3);
		expect(effect).toBeInstanceOf(WoundEffect);
		expect(effect.damage).toBe(3);
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

// ─── wound() factory — expression damage ─────────────────────────────────────

describe('wound() factory — expression damage', () => {
	it('wound(scalarExpression) creates a WoundEffect with that expression as damage', () => {
		const effect = wound(distance);
		expect(effect).toBeInstanceOf(WoundEffect);
		expect(effect.damage).toBe(distance);
	});

	it('wound(scalarExpression) defaults causedByAttack to false', () => {
		expect(wound(distance).causedByAttack).toBe(false);
	});
});

// ─── wound() factory — props object ──────────────────────────────────────────

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
		const effect = wound({ damage: 1, target: { type: 'player' } });
		expect(effect.target).toBeInstanceOf(Target);
	});

	it('wound({ damage }) has no target by default', () => {
		const effect = wound({ damage: 1 });
		expect(effect.target).toBeUndefined();
	});
});
