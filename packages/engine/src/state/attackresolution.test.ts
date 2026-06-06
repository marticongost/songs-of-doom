import { describe, expect, it } from 'vitest';
import { MutableAttackResolution, ReadonlyAttackResolution } from './attackresolution';

// ─── AttackResolution defaults ────────────────────────────────────────────────

describe('AttackResolution defaults', () => {
	it('damageModifier defaults to 0', () => {
		const res = new ReadonlyAttackResolution({
			subjectId: 'plr1',
			proficiency: 1,
			properties: [],
			defenderId: 'trt1'
		});
		expect(res.damageModifier).toBe(0);
	});

	it('negated defaults to false', () => {
		const res = new ReadonlyAttackResolution({
			subjectId: 'plr1',
			proficiency: 1,
			properties: [],
			defenderId: 'trt1'
		});
		expect(res.negated).toBe(false);
	});

	it('stores explicit damageModifier', () => {
		const res = new ReadonlyAttackResolution({
			subjectId: 'plr1',
			proficiency: 1,
			properties: [],
			defenderId: 'trt1',
			damageModifier: 3
		});
		expect(res.damageModifier).toBe(3);
	});

	it('stores explicit negated', () => {
		const res = new ReadonlyAttackResolution({
			subjectId: 'plr1',
			proficiency: 1,
			properties: [],
			defenderId: 'trt1',
			negated: true
		});
		expect(res.negated).toBe(true);
	});
});

// ─── ReadonlyAttackResolution.mutable ─────────────────────────────────────────

describe('ReadonlyAttackResolution.mutable', () => {
	it('returns a MutableAttackResolution', () => {
		const readonly = new ReadonlyAttackResolution({
			subjectId: 'plr1',
			proficiency: 1,
			properties: [],
			defenderId: 'trt1'
		});
		expect(readonly.mutable()).toBeInstanceOf(MutableAttackResolution);
	});

	it('copies damageModifier and negated', () => {
		const readonly = new ReadonlyAttackResolution({
			subjectId: 'plr1',
			proficiency: 1,
			properties: [],
			defenderId: 'trt1',
			damageModifier: 2,
			negated: true
		});
		const mutable = readonly.mutable();
		expect(mutable.damageModifier).toBe(2);
		expect(mutable.negated).toBe(true);
	});
});

// ─── MutableAttackResolution.readonly ─────────────────────────────────────────

describe('MutableAttackResolution.readonly', () => {
	it('returns a ReadonlyAttackResolution', () => {
		const mutable = new MutableAttackResolution({
			subjectId: 'plr1',
			proficiency: 1,
			properties: [],
			defenderId: 'trt1'
		});
		expect(mutable.readonly()).toBeInstanceOf(ReadonlyAttackResolution);
	});

	it('copies damageModifier and negated', () => {
		const mutable = new MutableAttackResolution({
			subjectId: 'plr1',
			proficiency: 1,
			properties: [],
			defenderId: 'trt1',
			damageModifier: 5,
			negated: true
		});
		const readonly = mutable.readonly();
		expect(readonly.damageModifier).toBe(5);
		expect(readonly.negated).toBe(true);
	});
});

// ─── round-trip ───────────────────────────────────────────────────────────────

describe('AttackResolution round-trip', () => {
	it('readonly → mutable → readonly preserves damageModifier and negated', () => {
		const original = new ReadonlyAttackResolution({
			subjectId: 'plr1',
			proficiency: 1,
			properties: [],
			defenderId: 'trt1',
			damageModifier: 4,
			negated: true
		});
		const roundTripped = original.mutable().readonly();
		expect(roundTripped.damageModifier).toBe(4);
		expect(roundTripped.negated).toBe(true);
	});
});
