import { mock } from '@songsofdoom/common/test-utils';
import { describe, expect, it } from 'vitest';
import { MutableAttackResolution } from '../game/attackresolution';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { MutableWoundResolution } from '../game/woundresolution';
import { ModifyDamageEffect, modifyDamage } from './modifydamage';

// ─── modifyDamage factory ─────────────────────────────────────────────────────

describe('modifyDamage factory', () => {
	it('modifyDamage(n) creates a ModifyDamageEffect', () => {
		expect(modifyDamage(2)).toBeInstanceOf(ModifyDamageEffect);
	});

	it('modifyDamage(n) sets amount to the given number', () => {
		expect(modifyDamage(3).amount).toBe(3);
	});

	it('modifyDamage({ amount }) creates a ModifyDamageEffect', () => {
		expect(modifyDamage({ amount: 4 })).toBeInstanceOf(ModifyDamageEffect);
	});
});

// ─── ModifyDamageEffect.apply — wound resolution active ──────────────────────

describe('ModifyDamageEffect.apply — wound resolution active', () => {
	it('increments damageModifier on the active wound resolution', async () => {
		const woundRes = new MutableWoundResolution({ targetId: 'trt1', damageDealt: 5 });
		const mutableState = mock<MutableGameState>({
			getActiveWoundResolution: () => woundRes,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			evaluate: (() => 2) as any
		});
		const graph = mock<GameGraph>();
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await modifyDamage(2).apply(graph);

		expect(woundRes.damageModifier).toBe(2);
	});

	it('does not touch the attack resolution when wound resolution is active', async () => {
		const woundRes = new MutableWoundResolution({ targetId: 'trt1', damageDealt: 5 });
		const attackRes = new MutableAttackResolution({
			subjectId: 'plr1',
			proficiency: 1,
			properties: [],
			defenderId: 'trt1'
		});
		const mutableState = mock<MutableGameState>({
			getActiveWoundResolution: () => woundRes,
			getActiveTestResolution: () => attackRes,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			evaluate: (() => 3) as any
		});
		const graph = mock<GameGraph>();
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await modifyDamage(3).apply(graph);

		expect(attackRes.damageModifier).toBe(0);
	});
});

// ─── ModifyDamageEffect.apply — attack resolution active ─────────────────────

describe('ModifyDamageEffect.apply — attack resolution active', () => {
	it('increments damageModifier on the active attack resolution', async () => {
		const attackRes = new MutableAttackResolution({
			subjectId: 'plr1',
			proficiency: 1,
			properties: [],
			defenderId: 'trt1'
		});
		const mutableState = mock<MutableGameState>({
			getActiveWoundResolution: () => undefined,
			getActiveTestResolution: () => attackRes,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			evaluate: (() => 3) as any
		});
		const graph = mock<GameGraph>();
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await modifyDamage(3).apply(graph);

		expect(attackRes.damageModifier).toBe(3);
	});
});

// ─── ModifyDamageEffect.apply — nothing active ───────────────────────────────

describe('ModifyDamageEffect.apply — nothing active', () => {
	it('is a no-op when neither wound nor attack resolution is active', async () => {
		const mutableState = mock<MutableGameState>({
			getActiveWoundResolution: () => undefined,
			getActiveTestResolution: () => undefined
		});
		const graph = mock<GameGraph>();
		graph.mutate.mockImplementation((fn) => fn(mutableState));

		await expect(modifyDamage(2).apply(graph)).resolves.toBeUndefined();
	});
});
