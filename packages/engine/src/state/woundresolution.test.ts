import { describe, expect, it } from 'vitest';
import { MutableWoundResolution, ReadonlyWoundResolution } from './woundresolution';

// ─── WoundResolution defaults ─────────────────────────────────────────────────

describe('WoundResolution defaults', () => {
	it('damageModifier defaults to 0', () => {
		const res = new ReadonlyWoundResolution({ targetId: 'trt1', damageDealt: 5 });
		expect(res.damageModifier).toBe(0);
	});

	it('negated defaults to false', () => {
		const res = new ReadonlyWoundResolution({ targetId: 'trt1', damageDealt: 5 });
		expect(res.negated).toBe(false);
	});

	it('stores explicit damageModifier', () => {
		const res = new ReadonlyWoundResolution({
			targetId: 'trt1',
			damageDealt: 5,
			damageModifier: -2
		});
		expect(res.damageModifier).toBe(-2);
	});

	it('stores explicit negated flag', () => {
		const res = new ReadonlyWoundResolution({
			targetId: 'trt1',
			damageDealt: 5,
			negated: true
		});
		expect(res.negated).toBe(true);
	});
});

// ─── ReadonlyWoundResolution.mutable ─────────────────────────────────────────

describe('ReadonlyWoundResolution.mutable', () => {
	it('returns a MutableWoundResolution', () => {
		const readonly = new ReadonlyWoundResolution({ targetId: 'trt1', damageDealt: 4 });
		expect(readonly.mutable()).toBeInstanceOf(MutableWoundResolution);
	});

	it('copies all fields', () => {
		const readonly = new ReadonlyWoundResolution({
			targetId: 'trt1',
			damageDealt: 4,
			damageModifier: 2,
			negated: true
		});
		const mutable = readonly.mutable();
		expect(mutable.targetId).toBe('trt1');
		expect(mutable.damageDealt).toBe(4);
		expect(mutable.damageModifier).toBe(2);
		expect(mutable.negated).toBe(true);
	});
});

// ─── MutableWoundResolution.readonly ─────────────────────────────────────────

describe('MutableWoundResolution.readonly', () => {
	it('returns a ReadonlyWoundResolution', () => {
		const mutable = new MutableWoundResolution({ targetId: 'trt1', damageDealt: 3 });
		expect(mutable.readonly()).toBeInstanceOf(ReadonlyWoundResolution);
	});

	it('copies all fields', () => {
		const mutable = new MutableWoundResolution({
			targetId: 'trt1',
			damageDealt: 3,
			damageModifier: -1,
			negated: false
		});
		const readonly = mutable.readonly();
		expect(readonly.targetId).toBe('trt1');
		expect(readonly.damageDealt).toBe(3);
		expect(readonly.damageModifier).toBe(-1);
		expect(readonly.negated).toBe(false);
	});
});

// ─── ReadonlyWoundResolution.mutate ──────────────────────────────────────────

describe('ReadonlyWoundResolution.mutate', () => {
	it('applies the change and returns a new ReadonlyWoundResolution', () => {
		const original = new ReadonlyWoundResolution({ targetId: 'trt1', damageDealt: 5 });
		const updated = original.mutate((m) => {
			m.damageModifier += 3;
		});
		expect(updated).toBeInstanceOf(ReadonlyWoundResolution);
		expect(updated.damageModifier).toBe(3);
	});

	it('does not mutate the original', () => {
		const original = new ReadonlyWoundResolution({ targetId: 'trt1', damageDealt: 5 });
		original.mutate((m) => {
			m.negated = true;
		});
		expect(original.negated).toBe(false);
	});
});

// ─── round-trip ───────────────────────────────────────────────────────────────

describe('WoundResolution round-trip', () => {
	it('readonly → mutable → readonly preserves all fields', () => {
		const original = new ReadonlyWoundResolution({
			targetId: 'trt1',
			damageDealt: 7,
			damageModifier: -3,
			negated: true
		});
		const roundTripped = original.mutable().readonly();
		expect(roundTripped.targetId).toBe(original.targetId);
		expect(roundTripped.damageDealt).toBe(original.damageDealt);
		expect(roundTripped.damageModifier).toBe(original.damageModifier);
		expect(roundTripped.negated).toBe(original.negated);
	});
});
